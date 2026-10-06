// mentors.controller.ts
// ========================
// Perfil de mentor — mesmo padrão de startups/investors, mas mais simples:
// sem busca com filtros nem entidade de segmentos (o Mentor não participa do
// score de compatibilidade de matches.service.ts, só é listado para
// solicitação direta de mentoria).
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
import { ApiOperation, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';
import type { RequestUser } from '../../common/interfaces';
import { TipoUsuario } from '../../common/enums';
import { MentorsService } from './mentors.service';
import { CreateMentorProfileDto } from './dto/create-mentor-profile.dto';
import { UpdateMentorProfileDto } from './dto/update-mentor-profile.dto';
import { MentorResponseDto } from './dto/mentor-response.dto';

@ApiTags('mentors')
@Controller('mentors')
export class MentorsController {
  constructor(private readonly mentorsService: MentorsService) {}

  @ApiOperation({ summary: 'Cria o perfil do mentor logado' })
  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.MENTOR)
  async create(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateMentorProfileDto,
  ): Promise<MentorResponseDto> {
    const mentor = await this.mentorsService.create(user.id, dto);
    return plainToInstance(MentorResponseDto, mentor);
  }

  @ApiOperation({ summary: 'Retorna o perfil do mentor logado' })
  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.MENTOR)
  async me(@CurrentUser() user: RequestUser): Promise<MentorResponseDto> {
    const mentor = await this.mentorsService.findByUserId(user.id);
    return plainToInstance(MentorResponseDto, mentor);
  }

  // Lista pública de mentores (usada pela tela "Mentorias" da Startup, para
  // escolher com quem solicitar uma sessão). Sem guard: qualquer visitante
  // logado pode ver a vitrine de mentores, igual à busca de startups/investidores.
  @ApiOperation({ summary: 'Lista os mentores' })
  @Get()
  async findAll(): Promise<MentorResponseDto[]> {
    const mentores = await this.mentorsService.findAll();
    return plainToInstance(MentorResponseDto, mentores);
  }

  @ApiOperation({ summary: 'Busca um mentor pelo id' })
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<MentorResponseDto> {
    const mentor = await this.mentorsService.findById(id);
    return plainToInstance(MentorResponseDto, mentor);
  }

  @ApiOperation({ summary: 'Atualiza o perfil do mentor logado' })
  @Patch('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.MENTOR)
  async updateMe(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateMentorProfileDto,
  ): Promise<MentorResponseDto> {
    const mentor = await this.mentorsService.update(user.id, dto);
    return plainToInstance(MentorResponseDto, mentor);
  }
}
