// matches.controller.ts
// ========================
// Conexões confirmadas (Match, criado por InterestsService quando o
// interesse vira mútuo) e a lista de sugestões rankeadas por score de
// compatibilidade (matches.service.ts / compatibility-score.ts). Só
// STARTUP/INVESTIDOR — o Match não existe para Mentor.
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';
import type { RequestUser } from '../../common/interfaces';
import { TipoUsuario } from '../../common/enums';
import { MatchesService } from './matches.service';
import { MatchResponseDto } from './dto/match-response.dto';
import { SuggestionResponseDto } from './dto/suggestion-response.dto';

@ApiTags('matches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @ApiOperation({ summary: 'Lista os matches do usuário logado' })
  @Get()
  @Roles(TipoUsuario.STARTUP, TipoUsuario.INVESTIDOR)
  async findAll(@CurrentUser() user: RequestUser): Promise<MatchResponseDto[]> {
    const matches = await this.matchesService.findAllForUser(
      user.id,
      user.tipo,
    );
    return plainToInstance(MatchResponseDto, matches);
  }

  @ApiOperation({ summary: 'Sugere perfis compatíveis (matchmaking)' })
  @Get('suggestions')
  @Roles(TipoUsuario.STARTUP, TipoUsuario.INVESTIDOR)
  async suggestions(
    @CurrentUser() user: RequestUser,
  ): Promise<SuggestionResponseDto[]> {
    const sugestoes = await this.matchesService.suggestions(user.id, user.tipo);
    return plainToInstance(SuggestionResponseDto, sugestoes);
  }

  @ApiOperation({ summary: 'Busca um match pelo id' })
  @Get(':id')
  @Roles(TipoUsuario.STARTUP, TipoUsuario.INVESTIDOR)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: RequestUser,
  ): Promise<MatchResponseDto> {
    const match = await this.matchesService.findById(id, user.id, user.tipo);
    return plainToInstance(MatchResponseDto, match);
  }
}
