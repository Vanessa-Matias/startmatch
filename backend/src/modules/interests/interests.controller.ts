// interests.controller.ts
// ==========================
// Manifestação de interesse entre startup e investidor (o gatilho do
// matchmaking) e as duas listas de acompanhamento (enviados/recebidos).
// Aberto só para STARTUP e INVESTIDOR — Mentor não participa desse fluxo.
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';
import type { RequestUser } from '../../common/interfaces';
import { TipoUsuario } from '../../common/enums';
import { InterestsService } from './interests.service';
import { CreateInterestDto } from './dto/create-interest.dto';
import { InterestResponseDto } from './dto/interest-response.dto';

@ApiTags('interests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('interests')
export class InterestsController {
  // >> Controller de interesses: recebe os pedidos de interesse do site.
  constructor(private readonly interestsService: InterestsService) {}

  @ApiOperation({
    summary: 'Demonstra interesse em outro perfil (pode gerar match)',
  })
  @Post()
  // >> ROTA: POST /api/interests. É o botão 'Tenho interesse'.
  @Roles(TipoUsuario.STARTUP, TipoUsuario.INVESTIDOR)
  async create(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateInterestDto,
  ): Promise<InterestResponseDto> {
    const interesse = await this.interestsService.create(
      user.id,
      user.tipo,
      dto,
    );
    return plainToInstance(InterestResponseDto, interesse);
  }

  @ApiOperation({
    summary: 'Mostra quanto da cota mensal de interesses já foi usada',
  })
  @Get('quota')
  // >> ROTA: GET /api/interests/quota. Plano Básico: 3 interesses por mês.
  @Roles(TipoUsuario.STARTUP, TipoUsuario.INVESTIDOR)
  async quota(@CurrentUser() user: RequestUser) {
    return this.interestsService.getQuota(user.id, user.tipo);
  }

  @ApiOperation({ summary: 'Lista os interesses enviados' })
  @Get('sent')
  // >> ROTA: GET /api/interests/sent. Interesses que a pessoa enviou.
  @Roles(TipoUsuario.STARTUP, TipoUsuario.INVESTIDOR)
  async sent(@CurrentUser() user: RequestUser): Promise<InterestResponseDto[]> {
    const interesses = await this.interestsService.findSent(user.id, user.tipo);
    return plainToInstance(InterestResponseDto, interesses);
  }

  @ApiOperation({ summary: 'Lista os interesses recebidos' })
  @Get('received')
  // >> ROTA: GET /api/interests/received. Interesses que a pessoa recebeu.
  @Roles(TipoUsuario.STARTUP, TipoUsuario.INVESTIDOR)
  async received(
    @CurrentUser() user: RequestUser,
  ): Promise<InterestResponseDto[]> {
    const interesses = await this.interestsService.findReceived(
      user.id,
      user.tipo,
    );
    return plainToInstance(InterestResponseDto, interesses);
  }
}
