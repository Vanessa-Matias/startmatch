// matches.service.ts
// =====================
// createIfNotExists() é chamado por InterestsService quando um interesse vira
// mútuo: calcula o score de compatibilidade (compatibility-score.ts) e já cria
// a Conversa vazia associada ao Match. findAllForUser()/findById() garantem
// que cada lado só vê/lê os próprios matches. suggestions() roda o mesmo
// cálculo de score contra todo mundo que ainda não deu match, pra rankear
// candidatos (usado pela tela de recomendações) — sem persistir nada.
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { Match } from './entities/match.entity';
import { Conversa } from '../conversations/entities/conversa.entity';
import { Startup } from '../startups/entities/startup.entity';
import { Investidor } from '../investors/entities/investidor.entity';
import { TipoUsuario } from '../../common/enums';
import { calculateCompatibilityScore } from './compatibility-score';

const MAX_SUGESTOES = 10;

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @InjectRepository(Conversa)
    private readonly conversaRepository: Repository<Conversa>,
    @InjectRepository(Startup)
    private readonly startupRepository: Repository<Startup>,
    @InjectRepository(Investidor)
    private readonly investidorRepository: Repository<Investidor>,
  ) {}

  async createIfNotExists(
    startupId: number,
    investidorId: number,
  ): Promise<Match> {
    const existente = await this.matchRepository.findOne({
      where: { startupId, investidorId },
    });
    if (existente) {
      return existente;
    }

    const startup = await this.startupRepository.findOneOrFail({
      where: { id: startupId },
      relations: { segmentos: true },
    });
    const investidor = await this.investidorRepository.findOneOrFail({
      where: { id: investidorId },
      relations: { segmentos: true },
    });

    const score = calculateCompatibilityScore(
      {
        investimentoPretendido: Number(startup.investimentoPretendido),
        cidade: startup.cidade,
        uf: startup.uf,
        segmentos: startup.segmentos.map((s) => ({
          segmentoId: s.segmento.id,
          principal: s.principal,
        })),
      },
      {
        investimentoMin: Number(investidor.investimentoMin),
        investimentoMax: Number(investidor.investimentoMax),
        cidade: investidor.cidade,
        uf: investidor.uf,
        segmentos: investidor.segmentos.map((s) => ({
          segmentoId: s.segmento.id,
          prioridade: s.prioridade,
        })),
      },
    );

    const match = await this.matchRepository.save(
      this.matchRepository.create({
        startupId,
        investidorId,
        scoreCompatibilidade: score,
      }),
    );

    await this.conversaRepository.save(
      this.conversaRepository.create({ matchId: match.id }),
    );

    return match;
  }

  async findAllForUser(
    callerId: number,
    callerTipo: TipoUsuario,
  ): Promise<Match[]> {
    if (callerTipo === TipoUsuario.STARTUP) {
      const startup = await this.startupRepository.findOne({
        where: { usuarioId: callerId },
      });
      if (!startup) return [];
      return this.matchRepository.find({
        where: { startupId: startup.id },
        relations: { investidor: { segmentos: true, usuario: true } },
        order: { criadoEm: 'DESC' },
      });
    }

    const investidor = await this.investidorRepository.findOne({
      where: { usuarioId: callerId },
    });
    if (!investidor) return [];
    return this.matchRepository.find({
      where: { investidorId: investidor.id },
      relations: { startup: { segmentos: true } },
      order: { criadoEm: 'DESC' },
    });
  }

  async findById(
    id: number,
    callerId: number,
    callerTipo: TipoUsuario,
  ): Promise<Match> {
    const match = await this.matchRepository.findOne({
      where: { id },
      relations: {
        startup: { segmentos: true },
        investidor: { segmentos: true },
      },
    });
    if (!match) {
      throw new NotFoundException('Match não encontrado.');
    }

    const pertence =
      callerTipo === TipoUsuario.STARTUP
        ? match.startup.usuarioId === callerId
        : match.investidor.usuarioId === callerId;

    if (!pertence) {
      throw new ForbiddenException('Este match não pertence a você.');
    }

    return match;
  }

  async suggestions(
    callerId: number,
    callerTipo: TipoUsuario,
  ): Promise<{ score: number; startup?: Startup; investidor?: Investidor }[]> {
    if (callerTipo === TipoUsuario.STARTUP) {
      const startup = await this.startupRepository.findOne({
        where: { usuarioId: callerId },
        relations: { segmentos: true },
      });
      if (!startup) return [];

      const jaMatched = await this.matchRepository.find({
        where: { startupId: startup.id },
      });
      const idsExcluidos = jaMatched.map((m) => m.investidorId);

      const candidatos = await this.investidorRepository.find({
        where: {
          perfilPublico: true,
          ...(idsExcluidos.length ? { id: Not(In(idsExcluidos)) } : {}),
        },
        relations: { segmentos: true },
      });

      const ranked = candidatos.map((investidor) => ({
        score: calculateCompatibilityScore(
          {
            investimentoPretendido: Number(startup.investimentoPretendido),
            cidade: startup.cidade,
            uf: startup.uf,
            segmentos: startup.segmentos.map((s) => ({
              segmentoId: s.segmento.id,
              principal: s.principal,
            })),
          },
          {
            investimentoMin: Number(investidor.investimentoMin),
            investimentoMax: Number(investidor.investimentoMax),
            cidade: investidor.cidade,
            uf: investidor.uf,
            segmentos: investidor.segmentos.map((s) => ({
              segmentoId: s.segmento.id,
              prioridade: s.prioridade,
            })),
          },
        ),
        investidor,
      }));

      return ranked.sort((a, b) => b.score - a.score).slice(0, MAX_SUGESTOES);
    }

    const investidor = await this.investidorRepository.findOne({
      where: { usuarioId: callerId },
      relations: { segmentos: true },
    });
    if (!investidor) return [];

    const jaMatched = await this.matchRepository.find({
      where: { investidorId: investidor.id },
    });
    const idsExcluidos = jaMatched.map((m) => m.startupId);

    const candidatos = await this.startupRepository.find({
      where: idsExcluidos.length ? { id: Not(In(idsExcluidos)) } : {},
      relations: { segmentos: true },
    });

    const ranked = candidatos.map((startup) => ({
      score: calculateCompatibilityScore(
        {
          investimentoPretendido: Number(startup.investimentoPretendido),
          cidade: startup.cidade,
          uf: startup.uf,
          segmentos: startup.segmentos.map((s) => ({
            segmentoId: s.segmento.id,
            principal: s.principal,
          })),
        },
        {
          investimentoMin: Number(investidor.investimentoMin),
          investimentoMax: Number(investidor.investimentoMax),
          cidade: investidor.cidade,
          uf: investidor.uf,
          segmentos: investidor.segmentos.map((s) => ({
            segmentoId: s.segmento.id,
            prioridade: s.prioridade,
          })),
        },
      ),
      startup,
    }));

    return ranked.sort((a, b) => b.score - a.score).slice(0, MAX_SUGESTOES);
  }
}
