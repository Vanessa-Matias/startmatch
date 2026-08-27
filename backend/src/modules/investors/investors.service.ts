// investors.service.ts
// =======================
// CRUD do perfil de Investidor e busca paginada (só entre perfis públicos).
// findById() aceita um requesterId opcional para permitir, no futuro, que o
// próprio dono veja seu perfil mesmo com perfilPublico = false — hoje o
// controller não passa esse parâmetro, então um perfil privado só é
// acessível via GET /investors/me.
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Investidor } from './entities/investidor.entity';
import { InvestidorSegmento } from './entities/investidor-segmento.entity';
import { CreateInvestorProfileDto } from './dto/create-investor-profile.dto';
import { UpdateInvestorProfileDto } from './dto/update-investor-profile.dto';
import { InvestorSearchQueryDto } from './dto/investor-search-query.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

@Injectable()
export class InvestorsService {
  constructor(
    @InjectRepository(Investidor)
    private readonly investidorRepository: Repository<Investidor>,
  ) {}

  private validateFaixa(min: number, max: number): void {
    if (min > max) {
      throw new BadRequestException(
        'O investimento mínimo não pode ser maior que o investimento máximo.',
      );
    }
  }

  async create(
    usuarioId: number,
    dto: CreateInvestorProfileDto,
  ): Promise<Investidor> {
    const existente = await this.investidorRepository.findOne({
      where: { usuarioId },
    });
    if (existente) {
      throw new ConflictException(
        'Este usuário já possui um perfil de investidor.',
      );
    }

    this.validateFaixa(dto.investimentoMin, dto.investimentoMax);

    const investidor = this.investidorRepository.create({
      usuarioId,
      tipo: dto.tipo,
      teseInvestimento: dto.teseInvestimento,
      investimentoMin: dto.investimentoMin,
      investimentoMax: dto.investimentoMax,
      cidade: dto.cidade,
      uf: dto.uf.toUpperCase(),
      perfilPublico: dto.perfilPublico ?? true,
      segmentos: dto.segmentos.map(
        (s) =>
          ({
            segmento: { id: s.segmentoId },
            prioridade: s.prioridade,
          }) as InvestidorSegmento,
      ),
    });

    return this.investidorRepository.save(investidor);
  }

  async findAll(
    query: InvestorSearchQueryDto,
  ): Promise<PaginatedResponseDto<Investidor>> {
    const qb = this.investidorRepository
      .createQueryBuilder('investidor')
      .leftJoinAndSelect('investidor.segmentos', 'investidorSegmento')
      .leftJoinAndSelect('investidorSegmento.segmento', 'segmento')
      .andWhere('investidor.perfilPublico = true');

    if (query.uf) {
      qb.andWhere('investidor.uf = :uf', { uf: query.uf.toUpperCase() });
    }
    if (query.segmentoId) {
      qb.andWhere('segmento.id = :segmentoId', {
        segmentoId: query.segmentoId,
      });
    }
    if (query.investimentoMin !== undefined) {
      qb.andWhere('investidor.investimentoMax >= :investimentoMin', {
        investimentoMin: query.investimentoMin,
      });
    }
    if (query.investimentoMax !== undefined) {
      qb.andWhere('investidor.investimentoMin <= :investimentoMax', {
        investimentoMax: query.investimentoMax,
      });
    }
    if (query.texto) {
      qb.andWhere('investidor.teseInvestimento ILIKE :texto', {
        texto: `%${query.texto}%`,
      });
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 12;

    const [items, total] = await qb
      .orderBy('investidor.criadoEm', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, total, page, limit };
  }

  async findById(id: number, requesterId?: number): Promise<Investidor> {
    const investidor = await this.investidorRepository.findOne({
      where: { id },
    });
    if (!investidor) {
      throw new NotFoundException('Investidor não encontrado.');
    }
    if (!investidor.perfilPublico && investidor.usuarioId !== requesterId) {
      throw new ForbiddenException('Este perfil não é público.');
    }
    return investidor;
  }

  async findByUserId(usuarioId: number): Promise<Investidor> {
    const investidor = await this.investidorRepository.findOne({
      where: { usuarioId },
    });
    if (!investidor) {
      throw new NotFoundException('Perfil de investidor ainda não cadastrado.');
    }
    return investidor;
  }

  async update(
    usuarioId: number,
    dto: UpdateInvestorProfileDto,
  ): Promise<Investidor> {
    const investidor = await this.findByUserId(usuarioId);

    const min = dto.investimentoMin ?? investidor.investimentoMin;
    const max = dto.investimentoMax ?? investidor.investimentoMax;
    this.validateFaixa(min, max);

    if (dto.segmentos) {
      investidor.segmentos = dto.segmentos.map(
        (s) =>
          ({
            segmento: { id: s.segmentoId },
            prioridade: s.prioridade,
          }) as InvestidorSegmento,
      );
    }

    Object.assign(investidor, {
      tipo: dto.tipo ?? investidor.tipo,
      teseInvestimento: dto.teseInvestimento ?? investidor.teseInvestimento,
      investimentoMin: min,
      investimentoMax: max,
      cidade: dto.cidade ?? investidor.cidade,
      uf: dto.uf ? dto.uf.toUpperCase() : investidor.uf,
      perfilPublico: dto.perfilPublico ?? investidor.perfilPublico,
      segmentos: investidor.segmentos,
    });

    return this.investidorRepository.save(investidor);
  }
}
