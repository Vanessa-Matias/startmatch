// lgpd.controller.ts
// =====================
// Registro e leitura de consentimentos LGPD do usuário logado (termos de
// uso/privacidade/marketing — ver TipoConsentimento). Suporta o levantamento
// de dados pessoais tratados descrito em docs/arquitetura.md, seção 5. O
// painel agregado de consentimentos para o admin fica em
// GET /admin/lgpd-summary (modules/admin), não aqui — este controller só
// cuida do consentimento do próprio usuário logado.
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';
import type { RequestUser } from '../../common/interfaces';
import { LgpdService } from './lgpd.service';
import { CreateConsentDto } from './dto/create-consent.dto';
import { ConsentResponseDto } from './dto/consent-response.dto';

@ApiTags('lgpd')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('lgpd')
export class LgpdController {
  constructor(private readonly lgpdService: LgpdService) {}

  @ApiOperation({ summary: 'Registra o consentimento LGPD do usuário' })
  @Post('consent')
  async register(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateConsentDto,
  ): Promise<ConsentResponseDto> {
    const consentimento = await this.lgpdService.register(user.id, dto);
    return plainToInstance(ConsentResponseDto, consentimento);
  }

  @ApiOperation({ summary: 'Lista os consentimentos LGPD do usuário logado' })
  @Get('consent')
  async findMine(
    @CurrentUser() user: RequestUser,
  ): Promise<ConsentResponseDto[]> {
    const consentimentos = await this.lgpdService.findByUser(user.id);
    return plainToInstance(ConsentResponseDto, consentimentos);
  }
}
