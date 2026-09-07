// business-canvas.controller.ts
// ================================
// Business Model Canvas completo (9 blocos) de cada startup. Só GET/PUT em
// "me" — é 1:1 com o perfil de startup do usuário logado, não existe
// listagem nem leitura por terceiros.
import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';
import type { RequestUser } from '../../common/interfaces';
import { TipoUsuario } from '../../common/enums';
import { BusinessCanvasService } from './business-canvas.service';
import { UpsertBusinessCanvasDto } from './dto/upsert-business-canvas.dto';
import { BusinessCanvasResponseDto } from './dto/business-canvas-response.dto';

@ApiTags('business-canvas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(TipoUsuario.STARTUP)
@Controller('business-canvas')
export class BusinessCanvasController {
  constructor(private readonly businessCanvasService: BusinessCanvasService) {}

  @Get('me')
  async me(
    @CurrentUser() user: RequestUser,
  ): Promise<BusinessCanvasResponseDto> {
    const plano = await this.businessCanvasService.findByUser(user.id);
    return plainToInstance(BusinessCanvasResponseDto, plano);
  }

  @Put('me')
  async upsert(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpsertBusinessCanvasDto,
  ): Promise<BusinessCanvasResponseDto> {
    const plano = await this.businessCanvasService.upsert(user.id, dto);
    return plainToInstance(BusinessCanvasResponseDto, plano);
  }
}
