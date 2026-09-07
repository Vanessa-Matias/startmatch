// admin.service.ts
// ==================
// Consultas de leitura (só contagens, sem escrita) usadas pelo painel
// administrativo. Deliberadamente simples: cada número é uma contagem direta no
// banco, sem cache nem série histórica — dá pra evoluir para gráficos de
// crescimento numa fase futura, quando existir um histórico de dados ao longo do
// tempo (fora do escopo da 1ª entrega).
//
// Também expõe o histórico de auditoria (delega ao AuditService) e o resumo
// agregado de consentimentos LGPD (delega ao LgpdService) — os dois itens da
// 2ª entrega que faltavam no painel administrativo.
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ObjectLiteral } from 'typeorm';
import { Usuario } from '../users/entities/usuario.entity';
import { Startup } from '../startups/entities/startup.entity';
import { Investidor } from '../investors/entities/investidor.entity';
import { Mentor } from '../mentors/entities/mentor.entity';
import { Match } from '../matches/entities/match.entity';
import {
  TipoUsuario,
  PlanoAssinatura,
  EstagioStartup,
} from '../../common/enums';
import { AuditService } from '../audit/audit.service';
import { LgpdService } from '../lgpd/lgpd.service';
import { AuditLogQueryDto } from '../audit/dto/audit-log-query.dto';
import { AuditLogResponseDto } from '../audit/dto/audit-log-response.dto';

export interface AdminMetrics {
  totalUsuarios: number;
  usuariosPorTipo: Record<string, number>;
  totalStartups: number;
  startupsPorPlano: Record<string, number>;
  startupsPorEstagio: Record<string, number>;
  totalInvestidores: number;
  investidoresPorPlano: Record<string, number>;
  totalMentores: number;
  mentoresPortoDigital: number;
  totalMatches: number;
}

export interface LgpdSummary {
  totalUsuarios: number;
  totalConsentimentosAceitos: number;
  porTipo: Record<string, number>;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Startup)
    private readonly startupRepository: Repository<Startup>,
    @InjectRepository(Investidor)
    private readonly investidorRepository: Repository<Investidor>,
    @InjectRepository(Mentor)
    private readonly mentorRepository: Repository<Mentor>,
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    private readonly auditService: AuditService,
    private readonly lgpdService: LgpdService,
  ) {}

  async getMetrics(): Promise<AdminMetrics> {
    const [
      totalUsuarios,
      totalStartups,
      totalInvestidores,
      totalMentores,
      totalMatches,
      mentoresPortoDigital,
    ] = await Promise.all([
      this.usuarioRepository.count(),
      this.startupRepository.count(),
      this.investidorRepository.count(),
      this.mentorRepository.count(),
      this.matchRepository.count(),
      this.mentorRepository.count({ where: { vinculoPortoDigital: true } }),
    ]);

    const [
      usuariosPorTipo,
      startupsPorPlano,
      startupsPorEstagio,
      investidoresPorPlano,
    ] = await Promise.all([
      this.countByField(
        this.usuarioRepository,
        'tipo',
        Object.values(TipoUsuario),
      ),
      this.countByField(
        this.startupRepository,
        'planoAssinatura',
        Object.values(PlanoAssinatura),
      ),
      this.countByField(
        this.startupRepository,
        'estagio',
        Object.values(EstagioStartup),
      ),
      this.countByField(
        this.investidorRepository,
        'planoAssinatura',
        Object.values(PlanoAssinatura),
      ),
    ]);

    return {
      totalUsuarios,
      usuariosPorTipo,
      totalStartups,
      startupsPorPlano,
      startupsPorEstagio,
      totalInvestidores,
      investidoresPorPlano,
      totalMentores,
      mentoresPortoDigital,
      totalMatches,
    };
  }

  async getAuditLog(query: AuditLogQueryDto): Promise<AuditLogResponseDto> {
    return this.auditService.listar(query);
  }

  async getLgpdSummary(): Promise<LgpdSummary> {
    const [totalUsuarios, totalConsentimentosAceitos, porTipo] =
      await Promise.all([
        this.usuarioRepository.count(),
        this.lgpdService.countTotal(),
        this.lgpdService.countByTipo(),
      ]);

    return { totalUsuarios, totalConsentimentosAceitos, porTipo };
  }

  // Conta quantas linhas existem para cada valor possível de um campo do tipo
  // enum (ex.: quantas startups em cada plano de assinatura). Genérica para não
  // repetir a mesma lógica 4 vezes.
  private async countByField<T extends ObjectLiteral>(
    repository: Repository<T>,
    field: string,
    values: string[],
  ): Promise<Record<string, number>> {
    const entries = await Promise.all(
      values.map(async (value) => {
        const count = await repository.count({
          where: { [field]: value } as never,
        });
        return [value, count] as const;
      }),
    );
    return Object.fromEntries(entries);
  }
}
