// mentorias.controller.ts
// ===========================
// Agendamento de mentorias. Startup pede e cancela; mentor aceita, recusa e
// marca como realizada (o que gera o certificado).
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { CurrentUser, Roles } from '../../common/decorators';
import type { RequestUser } from '../../common/interfaces';
import { TipoUsuario } from '../../common/enums';
import {
  CertificadoResponse,
  MentoriaResponse,
  MentoriasService,
} from './mentorias.service';
import { CreateMentoriaDto } from './dto/create-mentoria.dto';
import { UpdateMentoriaStatusDto } from './dto/update-mentoria-status.dto';

@ApiTags('mentorias')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('mentorias')
export class MentoriasController {
  constructor(private readonly mentoriasService: MentoriasService) {}

  @ApiOperation({
    summary: 'Startup pede uma mentoria (planos Plus e Premium)',
  })
  @Post()
  // >> ROTA: POST /api/mentorias.
  @Roles(TipoUsuario.STARTUP)
  create(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateMentoriaDto,
  ): Promise<MentoriaResponse> {
    return this.mentoriasService.create(user.id, dto);
  }

  @ApiOperation({
    summary: 'Mostra quantas mentorias a startup ainda pode agendar no mês',
  })
  @Get('quota')
  // >> ROTA: GET /api/mentorias/quota.
  @Roles(TipoUsuario.STARTUP)
  quota(@CurrentUser() user: RequestUser) {
    return this.mentoriasService.getQuota(user.id);
  }

  @ApiOperation({
    summary: 'Lista as mentorias do usuário logado (startup ou mentor)',
  })
  @Get()
  // >> ROTA: GET /api/mentorias.
  @Roles(TipoUsuario.STARTUP, TipoUsuario.MENTOR)
  findAll(@CurrentUser() user: RequestUser): Promise<MentoriaResponse[]> {
    return this.mentoriasService.findAllForUser(user.id, user.tipo);
  }

  @ApiOperation({
    summary: 'Muda o status: mentor aceita/recusa/realiza; startup cancela',
  })
  @Patch(':id/status')
  // >> ROTA: PATCH /api/mentorias/ID/status.
  @Roles(TipoUsuario.STARTUP, TipoUsuario.MENTOR)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateMentoriaStatusDto,
  ): Promise<MentoriaResponse> {
    return this.mentoriasService.updateStatus(
      id,
      user.id,
      user.tipo,
      dto.status,
    );
  }

  @ApiOperation({ summary: 'Certificado de uma mentoria realizada' })
  @Get(':id/certificado')
  // >> ROTA: GET /api/mentorias/ID/certificado.
  @Roles(TipoUsuario.STARTUP, TipoUsuario.MENTOR)
  certificado(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: RequestUser,
  ): Promise<CertificadoResponse> {
    return this.mentoriasService.getCertificado(id, user.id);
  }
}
