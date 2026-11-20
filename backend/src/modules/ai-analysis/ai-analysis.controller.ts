// ai-analysis.controller.ts
// ==========================
// Rota da atividade de IA: POST /api/ai/analise-compatibilidade.
// Só para quem está logado como INVESTIDOR (JwtAuthGuard + RolesGuard).
import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { CurrentUser, Roles } from '../../common/decorators';
import { TipoUsuario } from '../../common/enums';
import type { RequestUser } from '../../common/interfaces';
import {
  AiAnalysisService,
  AnaliseResposta,
  RecomendacaoResposta,
} from './ai-analysis.service';
import {
  AnaliseCompatibilidadeDto,
  RecomendarStartupsDto,
} from './dto/analise-compatibilidade.dto';

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(TipoUsuario.INVESTIDOR)
@Controller('ai')
export class AiAnalysisController {
  constructor(private readonly aiAnalysisService: AiAnalysisService) {}

  @ApiOperation({
    summary:
      'Análise de compatibilidade startup x investidor (regras em código + justificativa por IA)',
  })
  @Post('analise-compatibilidade')
  @HttpCode(200)
  async analisar(
    @CurrentUser() user: RequestUser,
    @Body() dto: AnaliseCompatibilidadeDto,
  ): Promise<AnaliseResposta> {
    return this.aiAnalysisService.analisar(user.id, dto);
  }

  @ApiOperation({
    summary:
      'Recomenda as startups mais alinhadas ao perfil do investidor (regras em código + justificativas por IA)',
  })
  @Post('recomendar-startups')
  @HttpCode(200)
  async recomendar(
    @CurrentUser() user: RequestUser,
    @Body() dto: RecomendarStartupsDto,
  ): Promise<RecomendacaoResposta> {
    return this.aiAnalysisService.recomendar(user.id, dto);
  }
}
