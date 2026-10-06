// investors.controller.ts
// ==========================
// Perfil de investidor — mesmo padrão de startups.controller.ts (criação
// restrita ao papel INVESTIDOR, busca pública com filtros, leitura própria e
// edição). A diferença fica no service: aqui existe a flag perfilPublico,
// que pode esconder um investidor da busca/leitura de terceiros.
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
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';
import type { RequestUser } from '../../common/interfaces';
import { TipoUsuario } from '../../common/enums';
import { InvestorsService } from './investors.service';
import { CreateInvestorProfileDto } from './dto/create-investor-profile.dto';
import { UpdateInvestorProfileDto } from './dto/update-investor-profile.dto';
import { InvestorSearchQueryDto } from './dto/investor-search-query.dto';
import { InvestorResponseDto } from './dto/investor-response.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

@ApiTags('investors')
@Controller('investors')
export class InvestorsController {
  constructor(private readonly investorsService: InvestorsService) {}

  @ApiOperation({ summary: 'Cria o perfil do investidor logado' })
  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.INVESTIDOR)
  async create(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateInvestorProfileDto,
  ): Promise<InvestorResponseDto> {
    const investidor = await this.investorsService.create(user.id, dto);
    return plainToInstance(InvestorResponseDto, investidor);
  }

  @ApiOperation({ summary: 'Lista/filtra investidores' })
  @Get()
  async findAll(
    @Query() query: InvestorSearchQueryDto,
  ): Promise<PaginatedResponseDto<InvestorResponseDto>> {
    const result = await this.investorsService.findAll(query);
    return {
      ...result,
      items: plainToInstance(InvestorResponseDto, result.items),
    };
  }

  @ApiOperation({ summary: 'Retorna o perfil do investidor logado' })
  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.INVESTIDOR)
  async me(@CurrentUser() user: RequestUser): Promise<InvestorResponseDto> {
    const investidor = await this.investorsService.findByUserId(user.id);
    return plainToInstance(InvestorResponseDto, investidor);
  }

  @ApiOperation({ summary: 'Busca um investidor pelo id' })
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<InvestorResponseDto> {
    const investidor = await this.investorsService.findById(id);
    return plainToInstance(InvestorResponseDto, investidor);
  }

  @ApiOperation({ summary: 'Atualiza o perfil do investidor logado' })
  @Patch('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.INVESTIDOR)
  async updateMe(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateInvestorProfileDto,
  ): Promise<InvestorResponseDto> {
    const investidor = await this.investorsService.update(user.id, dto);
    return plainToInstance(InvestorResponseDto, investidor);
  }
}
