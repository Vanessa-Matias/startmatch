// interests.service.ts
// =======================
// Registra o interesse de um lado (startup ou investidor) e, se já existir o
// interesse recíproco do outro lado para o mesmo par, aciona
// MatchesService.createIfNotExists() — é aqui que "duas manifestações de
// interesse" viram um Match. O par (startupId, investidorId, origem) é único
// no banco, por isso o ConflictException tratado a partir do QueryFailedError.
import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Interesse } from './entities/interesse.entity';
import {
  OrigemInteresse,
  PlanoAssinatura,
  TipoUsuario,
} from '../../common/enums';
import {
  inicioDoMes,
  LIMITE_INTERESSES_POR_MES,
} from '../../common/plan-limits';
import { StartupsService } from '../startups/startups.service';
import { InvestorsService } from '../investors/investors.service';
import { MatchesService } from '../matches/matches.service';
import { CreateInterestDto } from './dto/create-interest.dto';

@Injectable()
export class InterestsService {
  constructor(
    @InjectRepository(Interesse)
    private readonly interesseRepository: Repository<Interesse>,
    private readonly startupsService: StartupsService,
    private readonly investorsService: InvestorsService,
    private readonly matchesService: MatchesService,
  ) {}

  async create(
    callerId: number,
    callerTipo: TipoUsuario,
    dto: CreateInterestDto,
  ): Promise<Interesse> {
    // >> Registra o 'Tenho interesse' de uma startup ou investidor.
    let startupId: number;
    let investidorId: number;
    let origem: OrigemInteresse;
    let plano: PlanoAssinatura;

    if (callerTipo === TipoUsuario.STARTUP) {
      const startup = await this.startupsService.findByUserId(callerId);
      await this.investorsService.findById(dto.contraparteId);
      startupId = startup.id;
      investidorId = dto.contraparteId;
      origem = OrigemInteresse.STARTUP;
      plano = startup.planoAssinatura;
    } else {
      const investidor = await this.investorsService.findByUserId(callerId);
      await this.startupsService.findById(dto.contraparteId);
      startupId = dto.contraparteId;
      investidorId = investidor.id;
      origem = OrigemInteresse.INVESTIDOR;
      plano = investidor.planoAssinatura;
    }

    const origemOposta =
      origem === OrigemInteresse.STARTUP
        ? OrigemInteresse.INVESTIDOR
        : OrigemInteresse.STARTUP;

    // >> Plano Básico: máximo de 3 interesses novos por mês. Aceitar um interesse
    // >> que o outro lado já enviou NÃO gasta a cota (senão a pessoa não conseguiria
    // >> fechar um match que já está pronto).
    const jaRecebido = await this.interesseRepository.findOne({
      where: { startupId, investidorId, origem: origemOposta },
    });
    if (!jaRecebido) {
      await this.assertDentroDoLimite(origem, startupId, investidorId, plano);
    }

    let interesse: Interesse;
    try {
      interesse = await this.interesseRepository.save(
        this.interesseRepository.create({ startupId, investidorId, origem }),
      );
      // >> Salvou o interesse no banco.
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new ConflictException('Interesse já registrado.');
      }
      throw error;
    }

    const mutuo = await this.interesseRepository.findOne({
      where: { startupId, investidorId, origem: origemOposta },
    });
    // >> Procura se o outro lado já tinha demonstrado interesse.

    if (mutuo) {
      // >> Os dois lados têm interesse? Então é um MATCH!
      await this.matchesService.createIfNotExists(startupId, investidorId);
      // >> Cria o match e salva no banco (matches.service.ts).
    }

    return interesse;
  }

  // Conta os interesses que a pessoa enviou neste mês e que gastaram cota (os que
  // apenas aceitaram um interesse já recebido não contam).
  private async contarUsadosNoMes(
    origem: OrigemInteresse,
    startupId: number,
    investidorId: number,
  ): Promise<number> {
    const qb = this.interesseRepository
      .createQueryBuilder('i')
      .where('i.origem = :origem', { origem })
      .andWhere('i.criadoEm >= :inicio', { inicio: inicioDoMes() })
      .andWhere(
        origem === OrigemInteresse.STARTUP
          ? 'i.startupId = :id'
          : 'i.investidorId = :id',
        { id: origem === OrigemInteresse.STARTUP ? startupId : investidorId },
      )
      .andWhere(
        `NOT EXISTS (
          SELECT 1 FROM interesse o
          WHERE o.startup_id = i.startup_id
            AND o.investidor_id = i.investidor_id
            AND o.origem <> i.origem
            AND o.criado_em < i.criado_em
        )`,
      );
    return qb.getCount();
  }

  private async assertDentroDoLimite(
    origem: OrigemInteresse,
    startupId: number,
    investidorId: number,
    plano: PlanoAssinatura,
  ): Promise<void> {
    const limite = LIMITE_INTERESSES_POR_MES[plano];
    if (limite === null) return;
    const usados = await this.contarUsadosNoMes(
      origem,
      startupId,
      investidorId,
    );
    if (usados >= limite) {
      throw new ForbiddenException(
        `Você atingiu o limite de ${limite} interesses por mês do plano Básico. Assine o Plus ou o Premium para ter interesses ilimitados.`,
      );
    }
  }

  async getQuota(
    callerId: number,
    callerTipo: TipoUsuario,
  ): Promise<{
    plano: PlanoAssinatura;
    limite: number | null;
    usados: number;
    restantes: number | null;
  }> {
    // >> Quanto da cota mensal de interesses a pessoa já usou.
    let origem: OrigemInteresse;
    let startupId = 0;
    let investidorId = 0;
    let plano: PlanoAssinatura;
    if (callerTipo === TipoUsuario.STARTUP) {
      const startup = await this.startupsService.findByUserId(callerId);
      origem = OrigemInteresse.STARTUP;
      startupId = startup.id;
      plano = startup.planoAssinatura;
    } else {
      const investidor = await this.investorsService.findByUserId(callerId);
      origem = OrigemInteresse.INVESTIDOR;
      investidorId = investidor.id;
      plano = investidor.planoAssinatura;
    }
    const limite = LIMITE_INTERESSES_POR_MES[plano];
    const usados = await this.contarUsadosNoMes(
      origem,
      startupId,
      investidorId,
    );
    return {
      plano,
      limite,
      usados,
      restantes: limite === null ? null : Math.max(0, limite - usados),
    };
  }

  async findSent(
    callerId: number,
    callerTipo: TipoUsuario,
  ): Promise<Interesse[]> {
    if (callerTipo === TipoUsuario.STARTUP) {
      const startup = await this.startupsService.findByUserId(callerId);
      return this.interesseRepository.find({
        where: { startupId: startup.id, origem: OrigemInteresse.STARTUP },
        order: { criadoEm: 'DESC' },
      });
    }
    const investidor = await this.investorsService.findByUserId(callerId);
    return this.interesseRepository.find({
      where: {
        investidorId: investidor.id,
        origem: OrigemInteresse.INVESTIDOR,
      },
      order: { criadoEm: 'DESC' },
    });
  }

  async findReceived(
    callerId: number,
    callerTipo: TipoUsuario,
  ): Promise<Interesse[]> {
    if (callerTipo === TipoUsuario.STARTUP) {
      const startup = await this.startupsService.findByUserId(callerId);
      return this.interesseRepository.find({
        where: { startupId: startup.id, origem: OrigemInteresse.INVESTIDOR },
        order: { criadoEm: 'DESC' },
      });
    }
    const investidor = await this.investorsService.findByUserId(callerId);
    return this.interesseRepository.find({
      where: { investidorId: investidor.id, origem: OrigemInteresse.STARTUP },
      order: { criadoEm: 'DESC' },
    });
  }
}
