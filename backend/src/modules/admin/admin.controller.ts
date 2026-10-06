// admin.controller.ts
// =====================
// Endpoints usados só pela área administrativa do frontend (dashboard-admin,
// admin-planos, admin-relatorios, admin-auditoria, admin-lgpd). Todos exigem
// login + papel "admin" — é o backend que garante essa restrição (RolesGuard),
// o frontend só evita mostrar o link para quem não é admin.
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { TipoUsuario } from '../../common/enums';
import { AdminService, AdminMetrics, LgpdSummary } from './admin.service';
import { AuditLogQueryDto } from '../audit/dto/audit-log-query.dto';
import { AuditLogResponseDto } from '../audit/dto/audit-log-response.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(TipoUsuario.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Indicadores gerais da plataforma (contagens) — alimenta os cards do
  // dashboard-admin e as telas de admin-planos/admin-relatorios.
  @ApiOperation({ summary: 'Métricas gerais da plataforma (admin)' })
  @Get('metrics')
  async metrics(): Promise<AdminMetrics> {
    return this.adminService.getMetrics();
  }

  // Histórico de auditoria (tela admin-auditoria) — suporta filtro por tipo
  // de evento, por usuário (nome/e-mail) e paginação.
  @ApiOperation({ summary: 'Lista o log de auditoria, com filtros (admin)' })
  @Get('audit-log')
  async auditLog(
    @Query() query: AuditLogQueryDto,
  ): Promise<AuditLogResponseDto> {
    return this.adminService.getAuditLog(query);
  }

  // Resumo agregado de consentimentos LGPD (tela admin-lgpd) — quantos
  // usuários já aceitaram cada tipo de termo.
  @ApiOperation({ summary: 'Resumo agregado de consentimentos LGPD (admin)' })
  @Get('lgpd-summary')
  async lgpdSummary(): Promise<LgpdSummary> {
    return this.adminService.getLgpdSummary();
  }
}
