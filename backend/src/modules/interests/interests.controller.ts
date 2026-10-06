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
  constructor(private readonly interestsService: InterestsService) {}

  @ApiOperation({
    summary: 'Demonstra interesse em outro perfil (pode gerar match)',
  })
  @Post()
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

  @ApiOperation({ summary: 'Lista os interesses enviados' })
  @Get('sent')
  @Roles(TipoUsuario.STARTUP, TipoUsuario.INVESTIDOR)
  async sent(@CurrentUser() user: RequestUser): Promise<InterestResponseDto[]> {
    const interesses = await this.interestsService.findSent(user.id, user.tipo);
    return plainToInstance(InterestResponseDto, interesses);
  }

  @ApiOperation({ summary: 'Lista os interesses recebidos' })
  @Get('received')
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
