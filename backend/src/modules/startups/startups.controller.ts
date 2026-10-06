// startups.controller.ts
// =========================
// Perfil de startup: criação (só quem tem papel STARTUP), busca pública com
// filtros (usada nas telas de investidor/mentor), leitura do próprio perfil
// e edição. GET / e GET /:id ficam abertos (sem guard) porque a busca é uma
// vitrine pública — só criar/editar exige login + papel correto.
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../../common/guards';
import { RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';
import type { RequestUser } from '../../common/interfaces';
import { TipoUsuario } from '../../common/enums';
import { StartupsService } from './startups.service';
import { CreateStartupProfileDto } from './dto/create-startup-profile.dto';
import { UpdateStartupProfileDto } from './dto/update-startup-profile.dto';
import { StartupSearchQueryDto } from './dto/startup-search-query.dto';
import { StartupResponseDto } from './dto/startup-response.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

@ApiTags('startups')
@Controller('startups')
export class StartupsController {
  constructor(private readonly startupsService: StartupsService) {}

  @ApiOperation({ summary: 'Cria o perfil da startup logada' })
  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.STARTUP)
  async create(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateStartupProfileDto,
  ): Promise<StartupResponseDto> {
    const startup = await this.startupsService.create(user.id, dto);
    return plainToInstance(StartupResponseDto, startup);
  }

  @ApiOperation({ summary: 'Lista/filtra startups' })
  @Get()
  async findAll(
    @Query() query: StartupSearchQueryDto,
  ): Promise<PaginatedResponseDto<StartupResponseDto>> {
    const result = await this.startupsService.findAll(query);
    return {
      ...result,
      items: plainToInstance(StartupResponseDto, result.items),
    };
  }

  @ApiOperation({ summary: 'Retorna o perfil da startup logada' })
  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.STARTUP)
  async me(@CurrentUser() user: RequestUser): Promise<StartupResponseDto> {
    const startup = await this.startupsService.findByUserId(user.id);
    return plainToInstance(StartupResponseDto, startup);
  }

  @ApiOperation({ summary: 'Busca uma startup pelo id' })
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StartupResponseDto> {
    const startup = await this.startupsService.findById(id);
    return plainToInstance(StartupResponseDto, startup);
  }

  @ApiOperation({ summary: 'Atualiza o perfil da startup logada' })
  @Patch('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.STARTUP)
  async updateMe(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateStartupProfileDto,
  ): Promise<StartupResponseDto> {
    const startup = await this.startupsService.update(user.id, dto);
    return plainToInstance(StartupResponseDto, startup);
  }
}
