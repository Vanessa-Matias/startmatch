// conversations.service.ts
// ===========================
// assertParticipant() é o guard de negócio central deste módulo: toda leitura
// ou envio de mensagem passa por ele antes de tocar em qualquer dado, pra
// garantir que só quem participa da conversa acesse as mensagens.
//
// Dois tipos de conversa:
//   - de match: startup e investidor (criada pelo MatchesService);
//   - direta: o MENTOR fala quando quiser com uma startup ou investidor
//     (networking do mentor), sem precisar de match.
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Conversa } from './entities/conversa.entity';
import { Mensagem } from './entities/mensagem.entity';
import { Usuario } from '../users/entities/usuario.entity';
import { Startup } from '../startups/entities/startup.entity';
import { Investidor } from '../investors/entities/investidor.entity';
import { TipoUsuario } from '../../common/enums';
import { CreateMessageDto } from './dto/create-message.dto';
import { ConversationResponseDto } from './dto/conversation-response.dto';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversa)
    private readonly conversaRepository: Repository<Conversa>,
    @InjectRepository(Mensagem)
    private readonly mensagemRepository: Repository<Mensagem>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Startup)
    private readonly startupRepository: Repository<Startup>,
    @InjectRepository(Investidor)
    private readonly investidorRepository: Repository<Investidor>,
  ) {}

  async findAllForUser(callerId: number): Promise<ConversationResponseDto[]> {
    // >> Lista as conversas da pessoa (de match e diretas), já com o nome do outro lado.
    const conversas = await this.conversaRepository
      .createQueryBuilder('conversa')
      .leftJoinAndSelect('conversa.match', 'match')
      .leftJoinAndSelect('match.startup', 'startup')
      .leftJoinAndSelect('match.investidor', 'investidor')
      .leftJoinAndSelect('investidor.usuario', 'investidorUsuario')
      .where(
        `startup.usuarioId = :callerId
         OR investidor.usuarioId = :callerId
         OR conversa.mentorUsuarioId = :callerId
         OR conversa.contraparteUsuarioId = :callerId`,
        { callerId },
      )
      .orderBy('conversa.criadaEm', 'DESC')
      .getMany();

    // Nomes das conversas diretas (a outra pessoa é um usuário comum).
    const idsOutros = conversas
      .filter((c) => c.matchId === null)
      .map((c) =>
        c.mentorUsuarioId === callerId
          ? c.contraparteUsuarioId
          : c.mentorUsuarioId,
      )
      .filter((id): id is number => id !== null);
    const usuarios = idsOutros.length
      ? await this.usuarioRepository.find({ where: { id: In(idsOutros) } })
      : [];
    const nomePorId = new Map(usuarios.map((u) => [u.id, u.nome]));

    return conversas.map((c) => {
      if (c.match) {
        const souStartup = c.match.startup.usuarioId === callerId;
        const titulo = souStartup
          ? (c.match.investidor.usuario?.nome ??
            `Investidor #${c.match.investidorId}`)
          : c.match.startup.nomeFantasia;
        return {
          id: c.id,
          matchId: c.matchId,
          tipo: 'match' as const,
          titulo,
          criadaEm: c.criadaEm,
        };
      }
      const outroId =
        c.mentorUsuarioId === callerId
          ? c.contraparteUsuarioId
          : c.mentorUsuarioId;
      return {
        id: c.id,
        matchId: null,
        tipo: 'direta' as const,
        titulo:
          (outroId !== null && nomePorId.get(outroId)) || 'Conversa direta',
        criadaEm: c.criadaEm,
      };
    });
  }

  async createDirect(
    callerId: number,
    callerTipo: TipoUsuario,
    tipo: 'startup' | 'investidor',
    perfilId: number,
  ): Promise<ConversationResponseDto> {
    // >> Só o mentor inicia: ele pode falar com startups e investidores a qualquer hora.
    if (callerTipo !== TipoUsuario.MENTOR) {
      throw new ForbiddenException(
        'Só mentores podem iniciar uma conversa direta.',
      );
    }

    // Descobre o usuário dono do perfil escolhido.
    let usuarioId: number;
    if (tipo === 'startup') {
      const startup = await this.startupRepository.findOne({
        where: { id: perfilId },
      });
      if (!startup) throw new NotFoundException('Startup não encontrada.');
      usuarioId = startup.usuarioId;
    } else {
      const investidor = await this.investidorRepository.findOne({
        where: { id: perfilId },
      });
      if (!investidor)
        throw new NotFoundException('Investidor não encontrado.');
      usuarioId = investidor.usuarioId;
    }

    const alvo = await this.usuarioRepository.findOne({
      where: { id: usuarioId },
    });
    if (!alvo) {
      throw new NotFoundException('Usuário não encontrado.');
    }
    if (
      alvo.tipo !== TipoUsuario.STARTUP &&
      alvo.tipo !== TipoUsuario.INVESTIDOR
    ) {
      throw new BadRequestException(
        'O mentor só pode iniciar conversa com startups e investidores.',
      );
    }

    let conversa = await this.conversaRepository.findOne({
      where: { mentorUsuarioId: callerId, contraparteUsuarioId: alvo.id },
    });
    if (!conversa) {
      conversa = await this.conversaRepository.save(
        this.conversaRepository.create({
          matchId: null,
          mentorUsuarioId: callerId,
          contraparteUsuarioId: alvo.id,
        }),
      );
    }
    return {
      id: conversa.id,
      matchId: null,
      tipo: 'direta',
      titulo:
        tipo === 'startup'
          ? ((await this.startupRepository.findOne({ where: { id: perfilId } }))
              ?.nomeFantasia ?? alvo.nome)
          : alvo.nome,
      criadaEm: conversa.criadaEm,
    };
  }

  private async assertParticipant(
    conversaId: number,
    callerId: number,
  ): Promise<Conversa> {
    const conversa = await this.conversaRepository.findOne({
      where: { id: conversaId },
      relations: { match: { startup: true, investidor: true } },
    });

    if (!conversa) {
      throw new NotFoundException('Conversa não encontrada.');
    }

    const pertence = conversa.match
      ? conversa.match.startup.usuarioId === callerId ||
        conversa.match.investidor.usuarioId === callerId
      : conversa.mentorUsuarioId === callerId ||
        conversa.contraparteUsuarioId === callerId;

    if (!pertence) {
      throw new ForbiddenException('Você não participa desta conversa.');
    }

    return conversa;
  }

  async findMessages(
    conversaId: number,
    callerId: number,
  ): Promise<Mensagem[]> {
    await this.assertParticipant(conversaId, callerId);
    return this.mensagemRepository.find({
      where: { conversaId },
      order: { enviadaEm: 'ASC' },
    });
  }

  async postMessage(
    conversaId: number,
    callerId: number,
    dto: CreateMessageDto,
  ): Promise<Mensagem> {
    await this.assertParticipant(conversaId, callerId);
    const mensagem = this.mensagemRepository.create({
      conversaId,
      remetenteId: callerId,
      conteudo: dto.conteudo,
    });
    return this.mensagemRepository.save(mensagem);
  }
}
