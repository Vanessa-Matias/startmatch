// beta-evaluation.controller.ts
// ================================
// Avaliação de uso enviada por beta testers (notas de usabilidade/utilidade +
// comentário). Qualquer usuário logado pode enviar a sua; só o admin pode
// listar todas — pensado para rodar com usuários reais na fase de validação
// (2ª entrega).
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';
import type { RequestUser } from '../../common/interfaces';
import { TipoUsuario } from '../../common/enums';
import { BetaEvaluationService } from './beta-evaluation.service';
import { CreateBetaEvaluationDto } from './dto/create-beta-evaluation.dto';
import { BetaEvaluationResponseDto } from './dto/beta-evaluation-response.dto';

@ApiTags('beta-evaluation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('beta-evaluation')
export class BetaEvaluationController {
  constructor(private readonly betaEvaluationService: BetaEvaluationService) {}

  @ApiOperation({ summary: 'Envia uma avaliação da versão beta' })
  @Post()
  async create(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateBetaEvaluationDto,
  ): Promise<BetaEvaluationResponseDto> {
    const avaliacao = await this.betaEvaluationService.create(user.id, dto);
    return plainToInstance(BetaEvaluationResponseDto, avaliacao);
  }

  @ApiOperation({ summary: 'Lista todas as avaliações beta (admin)' })
  @Get()
  @UseGuards(RolesGuard)
  @Roles(TipoUsuario.ADMIN)
  async findAll(): Promise<BetaEvaluationResponseDto[]> {
    const avaliacoes = await this.betaEvaluationService.findAll();
    return plainToInstance(BetaEvaluationResponseDto, avaliacoes);
  }
}
