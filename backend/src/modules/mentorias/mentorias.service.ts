// mentorias.service.ts
// =======================
// Regras do agendamento de mentorias:
//   - só STARTUP agenda, e só nos planos Plus (1 por mês) e Premium (2 por mês);
//   - o mentor tem um limite de mentorias por mês (campo do perfil dele) e não
//     pode ter dois horários iguais;
//   - o mentor aceita, recusa e marca como realizada (gera o certificado);
//   - a startup pode cancelar enquanto estiver pendente ou aceita.
import { randomBytes } from 'crypto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { Mentoria } from './entities/mentoria.entity';
import { Mentor } from '../mentors/entities/mentor.entity';
import { Startup } from '../startups/entities/startup.entity';
import {
  ModalidadeMentoria,
  PlanoAssinatura,
  StatusMentoria,
  TipoUsuario,
} from '../../common/enums';
import {
  inicioDoMes,
  LIMITE_MENTORIAS_POR_MES,
} from '../../common/plan-limits';
import { CreateMentoriaDto } from './dto/create-mentoria.dto';

// Status que ocupam vaga na cota do mês (recusada e cancelada liberam a vaga).
const STATUS_QUE_OCUPAM = [
  StatusMentoria.PENDENTE,
  StatusMentoria.ACEITA,
  StatusMentoria.REALIZADA,
];

export interface MentoriaResponse {
  id: number;
  mentorId: number;
  mentorNome: string;
  mentorUsuarioId: number;
  startupId: number;
  startupNome: string;
  startupUsuarioId: number;
  startupCidade: string;
  startupUf: string;
  dataHora: Date;
  tema: string;
  mensagem: string;
  status: StatusMentoria;
  duracaoMinutos: number;
  modalidade: ModalidadeMentoria;
  codigoCertificado: string | null;
  realizadaEm: Date | null;
  criadoEm: Date;
}

export interface CertificadoResponse {
  codigo: string;
  mentorNome: string;
  startupNome: string;
  dataHora: Date;
  duracaoMinutos: number;
  modalidade: ModalidadeMentoria;
  tema: string;
  emitidoEm: Date | null;
}

@Injectable()
export class MentoriasService {
  constructor(
    @InjectRepository(Mentoria)
    private readonly mentoriaRepository: Repository<Mentoria>,
    @InjectRepository(Mentor)
    private readonly mentorRepository: Repository<Mentor>,
    @InjectRepository(Startup)
    private readonly startupRepository: Repository<Startup>,
  ) {}

  private paraResposta(m: Mentoria): MentoriaResponse {
    return {
      id: m.id,
      mentorId: m.mentorId,
      mentorNome: m.mentor?.usuario?.nome ?? `Mentor #${m.mentorId}`,
      mentorUsuarioId: m.mentor?.usuarioId,
      startupId: m.startupId,
      startupNome: m.startup?.nomeFantasia ?? `Startup #${m.startupId}`,
      startupUsuarioId: m.startup?.usuarioId,
      startupCidade: m.startup?.cidade ?? '',
      startupUf: m.startup?.uf ?? '',
      dataHora: m.dataHora,
      tema: m.tema,
      mensagem: m.mensagem,
      status: m.status,
      duracaoMinutos: m.mentor?.duracaoMinutos ?? 60,
      modalidade: m.mentor?.modalidade ?? ModalidadeMentoria.REMOTO,
      codigoCertificado: m.codigoCertificado,
      realizadaEm: m.realizadaEm,
      criadoEm: m.criadoEm,
    };
  }

  private async carregar(id: number): Promise<Mentoria> {
    const mentoria = await this.mentoriaRepository.findOne({
      where: { id },
      relations: { mentor: { usuario: true }, startup: true },
    });
    if (!mentoria) {
      throw new NotFoundException('Mentoria não encontrada.');
    }
    return mentoria;
  }

  // Intervalo [início, fim] do mês da data informada.
  private intervaloDoMes(data: Date): [Date, Date] {
    const inicio = inicioDoMes(data);
    const fim = new Date(
      data.getFullYear(),
      data.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );
    return [inicio, fim];
  }

  async getQuota(callerId: number): Promise<{
    plano: PlanoAssinatura;
    limite: number;
    usados: number;
    restantes: number;
  }> {
    // >> Quantas mentorias a startup ainda pode agendar neste mês.
    const startup = await this.startupRepository.findOne({
      where: { usuarioId: callerId },
    });
    if (!startup) {
      throw new NotFoundException('Perfil de startup ainda não cadastrado.');
    }
    const limite = LIMITE_MENTORIAS_POR_MES[startup.planoAssinatura];
    const [inicio, fim] = this.intervaloDoMes(new Date());
    const usados = await this.mentoriaRepository.count({
      where: {
        startupId: startup.id,
        status: In(STATUS_QUE_OCUPAM),
        dataHora: Between(inicio, fim),
      },
    });
    return {
      plano: startup.planoAssinatura,
      limite,
      usados,
      restantes: Math.max(0, limite - usados),
    };
  }

  async create(
    callerId: number,
    dto: CreateMentoriaDto,
  ): Promise<MentoriaResponse> {
    // >> A startup pede uma mentoria. Ela fica "pendente" até o mentor responder.
    const startup = await this.startupRepository.findOne({
      where: { usuarioId: callerId },
    });
    if (!startup) {
      throw new NotFoundException('Perfil de startup ainda não cadastrado.');
    }

    const limite = LIMITE_MENTORIAS_POR_MES[startup.planoAssinatura];
    if (limite === 0) {
      throw new ForbiddenException(
        'Agendar mentorias é um recurso dos planos Plus (1 por mês) e Premium (2 por mês).',
      );
    }

    const mentor = await this.mentorRepository.findOne({
      where: { id: dto.mentorId },
      relations: { usuario: true },
    });
    if (!mentor) {
      throw new NotFoundException('Mentor não encontrado.');
    }

    const dataHora = new Date(dto.dataHora);
    if (Number.isNaN(dataHora.getTime()) || dataHora.getTime() <= Date.now()) {
      throw new BadRequestException('Escolha uma data e um horário futuros.');
    }

    const [inicio, fim] = this.intervaloDoMes(dataHora);

    const usadosStartup = await this.mentoriaRepository.count({
      where: {
        startupId: startup.id,
        status: In(STATUS_QUE_OCUPAM),
        dataHora: Between(inicio, fim),
      },
    });
    if (usadosStartup >= limite) {
      throw new ForbiddenException(
        `Seu plano permite ${limite} mentoria(s) por mês e você já usou ${usadosStartup} neste mês.`,
      );
    }

    const doMentorNoMes = await this.mentoriaRepository.find({
      where: {
        mentorId: mentor.id,
        status: In(STATUS_QUE_OCUPAM),
        dataHora: Between(inicio, fim),
      },
    });
    if (doMentorNoMes.length >= mentor.mentoriasPorMes) {
      throw new ConflictException(
        'Este mentor já atingiu o limite de mentorias deste mês. Escolha outro mês ou outro mentor.',
      );
    }
    const duracaoMs = mentor.duracaoMinutos * 60_000;
    const choca = doMentorNoMes.some(
      (m) => Math.abs(m.dataHora.getTime() - dataHora.getTime()) < duracaoMs,
    );
    if (choca) {
      throw new ConflictException(
        'O mentor já tem uma mentoria neste horário. Escolha outro horário.',
      );
    }

    const salva = await this.mentoriaRepository.save(
      this.mentoriaRepository.create({
        mentorId: mentor.id,
        startupId: startup.id,
        dataHora,
        tema: dto.tema,
        mensagem: dto.mensagem ?? '',
      }),
    );
    return this.paraResposta(await this.carregar(salva.id));
  }

  async findAllForUser(
    callerId: number,
    callerTipo: TipoUsuario,
  ): Promise<MentoriaResponse[]> {
    // >> Startup vê as que pediu. Mentor vê as que recebeu.
    let where: { startupId: number } | { mentorId: number };
    if (callerTipo === TipoUsuario.STARTUP) {
      const startup = await this.startupRepository.findOne({
        where: { usuarioId: callerId },
      });
      if (!startup) return [];
      where = { startupId: startup.id };
    } else {
      const mentor = await this.mentorRepository.findOne({
        where: { usuarioId: callerId },
      });
      if (!mentor) return [];
      where = { mentorId: mentor.id };
    }
    const lista = await this.mentoriaRepository.find({
      where,
      relations: { mentor: { usuario: true }, startup: true },
      order: { dataHora: 'ASC' },
    });
    return lista.map((m) => this.paraResposta(m));
  }

  async updateStatus(
    id: number,
    callerId: number,
    callerTipo: TipoUsuario,
    novo: StatusMentoria,
  ): Promise<MentoriaResponse> {
    const mentoria = await this.carregar(id);
    const atual = mentoria.status;

    if (callerTipo === TipoUsuario.MENTOR) {
      if (mentoria.mentor.usuarioId !== callerId) {
        throw new ForbiddenException('Esta mentoria não é sua.');
      }
      const permitido =
        (atual === StatusMentoria.PENDENTE &&
          (novo === StatusMentoria.ACEITA ||
            novo === StatusMentoria.RECUSADA)) ||
        (atual === StatusMentoria.ACEITA && novo === StatusMentoria.REALIZADA);
      if (!permitido) {
        throw new BadRequestException(
          `Não é possível mudar de "${atual}" para "${novo}".`,
        );
      }
      if (
        novo === StatusMentoria.REALIZADA &&
        mentoria.dataHora.getTime() > Date.now()
      ) {
        throw new BadRequestException(
          'A mentoria só pode ser marcada como realizada depois do horário combinado.',
        );
      }
    } else if (callerTipo === TipoUsuario.STARTUP) {
      if (mentoria.startup.usuarioId !== callerId) {
        throw new ForbiddenException('Esta mentoria não é sua.');
      }
      const permitido =
        novo === StatusMentoria.CANCELADA &&
        (atual === StatusMentoria.PENDENTE || atual === StatusMentoria.ACEITA);
      if (!permitido) {
        throw new BadRequestException(
          'A startup só pode cancelar mentorias pendentes ou aceitas.',
        );
      }
    } else {
      throw new ForbiddenException('Sem permissão para alterar mentorias.');
    }

    mentoria.status = novo;
    if (novo === StatusMentoria.REALIZADA) {
      // >> Gera o código do certificado (ex.: SM-2026-00012-A1B2).
      const sufixo = randomBytes(2).toString('hex').toUpperCase();
      mentoria.codigoCertificado = `SM-${mentoria.dataHora.getFullYear()}-${String(
        mentoria.id,
      ).padStart(5, '0')}-${sufixo}`;
      mentoria.realizadaEm = new Date();
    }
    await this.mentoriaRepository.save(mentoria);
    return this.paraResposta(await this.carregar(id));
  }

  async getCertificado(
    id: number,
    callerId: number,
  ): Promise<CertificadoResponse> {
    // >> Certificado da mentoria: só quem participou consegue ver.
    const m = await this.carregar(id);
    const participa =
      m.mentor.usuarioId === callerId || m.startup.usuarioId === callerId;
    if (!participa) {
      throw new ForbiddenException('Você não participou desta mentoria.');
    }
    if (m.status !== StatusMentoria.REALIZADA || !m.codigoCertificado) {
      throw new BadRequestException(
        'O certificado só existe depois que a mentoria é realizada.',
      );
    }
    return {
      codigo: m.codigoCertificado,
      mentorNome: m.mentor.usuario?.nome ?? `Mentor #${m.mentorId}`,
      startupNome: m.startup.nomeFantasia,
      dataHora: m.dataHora,
      duracaoMinutos: m.mentor.duracaoMinutos,
      modalidade: m.mentor.modalidade,
      tema: m.tema,
      emitidoEm: m.realizadaEm,
    };
  }
}
