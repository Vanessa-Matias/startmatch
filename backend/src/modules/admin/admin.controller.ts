// admin.controller.ts
// =====================
// Endpoints usados só pela área administrativa do frontend (dashboard-admin,
// admin-planos, admin-relatorios). Todos exigem login + papel "admin" — é o
// backend que garante essa restrição (RolesGuard), o frontend só evita mostrar o
// link para quem não é admin.
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { TipoUsuario } from '../../common/enums';
import { AdminService, AdminMetrics } from './admin.service';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(TipoUsuario.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Indicadores gerais da plataforma (contagens) — alimenta os cards do
  // dashboard-admin e as telas de admin-planos/admin-relatorios.
  @Get('metrics')
  async metrics(): Promise<AdminMetrics> {
    return this.adminService.getMetrics();
  }
}
