// audit.service.ts
// ===================
// Serviço simples de auditoria: `registrar()` é chamado por outros módulos
// (auth, lgpd, mentors) sempre que algo relevante acontece; `listar()` alimenta
// a tela admin-auditoria. Deliberadamente sem fila/assíncrono nem interceptor
// genérico — cada chamada de `registrar()` é explícita no serviço de origem,
// o que deixa claro, lendo o código daquele módulo, o que fica registrado.
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogAuditoria } from './entities/log-auditoria.entity';
import { TipoEventoAuditoria, ResultadoAuditoria } from '../../common/enums';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';
import { AuditLogResponseDto } from './dto/audit-log-response.dto';

interface RegistrarParams {
  usuarioId: number;
  tipoEvento: TipoEventoAuditoria;
  evento: string;
  acao: string;
  resultado: ResultadoAuditoria;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(LogAuditoria)
    private readonly logRepository: Repository<LogAuditoria>,
  ) {}

  // Nunca deve derrubar a operação que está sendo auditada — se o registro de
  // log falhar (ex.: banco fora do ar num pico), a ação principal (login,
  // cadastro...) já aconteceu e não deve ser desfeita por causa disso.
  async registrar(params: RegistrarParams): Promise<void> {
    try {
      const log = this.logRepository.create({
        usuarioId: params.usuarioId,
        tipoEvento: params.tipoEvento,
        evento: params.evento,
        acao: params.acao,
        resultado: params.resultado,
      });
      await this.logRepository.save(log);
    } catch {
      // Auditoria é best-effort — falha silenciosa de propósito.
    }
  }

  async listar(query: AuditLogQueryDto): Promise<AuditLogResponseDto> {
    const qb = this.logRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.usuario', 'usuario')
      .orderBy('log.criadoEm', 'DESC');

    if (query.tipo) {
      qb.andWhere('log.tipoEvento = :tipo', { tipo: query.tipo });
    }

    if (query.usuario) {
      qb.andWhere('(usuario.nome ILIKE :busca OR usuario.email ILIKE :busca)', {
        busca: `%${query.usuario}%`,
      });
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 50;

    const [logs, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items: logs.map((log) => ({
        data: new Date(log.criadoEm).toLocaleString('pt-BR'),
        dataISO: new Date(log.criadoEm).toISOString().slice(0, 10),
        usuario: log.usuario?.nome ?? 'Usuário removido',
        email: log.usuario?.email ?? '—',
        tipo: log.tipoEvento,
        evento: log.evento,
        acao: log.acao,
        resultado: this.formatarResultado(log.resultado),
        origem: log.origem,
      })),
      total,
      page,
      limit,
    };
  }

  private formatarResultado(
    resultado: ResultadoAuditoria,
  ): 'Sucesso' | 'Falha' | 'Pendente' {
    if (resultado === ResultadoAuditoria.SUCESSO) return 'Sucesso';
    if (resultado === ResultadoAuditoria.FALHA) return 'Falha';
    return 'Pendente';
  }
}
