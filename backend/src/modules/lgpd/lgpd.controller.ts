// lgpd.controller.ts
// =====================
// Registro e leitura de consentimentos LGPD do usuário logado (termos de
// uso/privacidade/marketing — ver TipoConsentimento). Suporta o levantamento
// de dados pessoais tratados descrito em docs/arquitetura.md, seção 5; o
// painel agregado de consentimentos para o admin ainda não existe (2ª
// entrega).
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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

  @Post('consent')
  async register(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateConsentDto,
  ): Promise<ConsentResponseDto> {
    const consentimento = await this.lgpdService.register(user.id, dto);
    return plainToInstance(ConsentResponseDto, consentimento);
  }

  @Get('consent')
  async findMine(
    @CurrentUser() user: RequestUser,
  ): Promise<ConsentResponseDto[]> {
    const consentimentos = await this.lgpdService.findByUser(user.id);
    return plainToInstance(ConsentResponseDto, consentimentos);
  }
}
