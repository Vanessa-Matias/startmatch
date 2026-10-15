// startups.service.ts
// ======================
// CRUD do perfil de Startup (1:1 com Usuario, por isso create() rejeita se já
// existir um perfil para o usuarioId) e a busca paginada com filtros de
// estágio/UF/segmento/texto usada pela vitrine pública. A validação de
// segmentos (exatamente um "principal") fica centralizada aqui porque se
// repete em create() e update().
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Startup } from './entities/startup.entity';
import { StartupSegmento } from './entities/startup-segmento.entity';
import { CreateStartupProfileDto } from './dto/create-startup-profile.dto';
import { UpdateStartupProfileDto } from './dto/update-startup-profile.dto';
import { StartupSearchQueryDto } from './dto/startup-search-query.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

@Injectable()
export class StartupsService {
  constructor(
    @InjectRepository(Startup)
    private readonly startupRepository: Repository<Startup>,
  ) {}

  private validateSegmentos(
    segmentos: { segmentoId: number; principal: boolean }[],
  ): void {
    const principais = segmentos.filter((s) => s.principal);
    if (principais.length !== 1) {
      throw new BadRequestException(
        'Selecione exatamente um segmento como principal.',
      );
    }
  }

  async create(
    usuarioId: number,
    dto: CreateStartupProfileDto,
  ): Promise<Startup> {
    const existente = await this.startupRepository.findOne({
      where: { usuarioId },
    });
    if (existente) {
      throw new ConflictException(
        'Este usuário já possui um perfil de startup.',
      );
    }

    this.validateSegmentos(dto.segmentos);

    const startup = this.startupRepository.create({
      usuarioId,
      nomeFantasia: dto.nomeFantasia,
      cnpj: dto.cnpj,
      descricao: dto.descricao,
      estagio: dto.estagio,
      investimentoPretendido: dto.investimentoPretendido,
      cidade: dto.cidade,
      uf: dto.uf.toUpperCase(),
      segmentos: dto.segmentos.map(
        (s) =>
          ({
            segmento: { id: s.segmentoId },
            principal: s.principal,
          }) as StartupSegmento,
      ),
    });

    return this.startupRepository.save(startup);
  }

  async findAll(
    query: StartupSearchQueryDto,
  ): Promise<PaginatedResponseDto<Startup>> {
    const qb = this.startupRepository
      .createQueryBuilder('startup')
      .leftJoinAndSelect('startup.segmentos', 'startupSegmento')
      .leftJoinAndSelect('startupSegmento.segmento', 'segmento');

    if (query.estagio) {
      qb.andWhere('startup.estagio = :estagio', { estagio: query.estagio });
    }
    if (query.uf) {
      qb.andWhere('startup.uf = :uf', { uf: query.uf.toUpperCase() });
    }
    if (query.segmentoId) {
      qb.andWhere('segmento.id = :segmentoId', {
        segmentoId: query.segmentoId,
      });
    }
    if (query.texto) {
      qb.andWhere(
        '(startup.nomeFantasia ILIKE :texto OR startup.descricao ILIKE :texto)',
        {
          texto: `%${query.texto}%`,
        },
      );
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 12;

    const [items, total] = await qb
      .orderBy('startup.criadoEm', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, total, page, limit };
  }

  async findById(id: number): Promise<Startup> {
    const startup = await this.startupRepository.findOne({
      where: { id },
      relations: ['segmentos'],
    });
    if (!startup) {
      throw new NotFoundException('Startup não encontrada.');
    }
    return startup;
  }

  async findByUserId(usuarioId: number): Promise<Startup> {
    const startup = await this.startupRepository.findOne({
      where: { usuarioId },
    });
    if (!startup) {
      throw new NotFoundException('Perfil de startup ainda não cadastrado.');
    }
    return startup;
  }

  async update(
    usuarioId: number,
    dto: UpdateStartupProfileDto,
  ): Promise<Startup> {
    const startup = await this.findByUserId(usuarioId);

    if (dto.segmentos) {
      this.validateSegmentos(dto.segmentos);
      startup.segmentos = dto.segmentos.map(
        (s) =>
          ({
            segmento: { id: s.segmentoId },
            principal: s.principal,
          }) as StartupSegmento,
      );
    }

    Object.assign(startup, {
      nomeFantasia: dto.nomeFantasia ?? startup.nomeFantasia,
      cnpj: dto.cnpj ?? startup.cnpj,
      descricao: dto.descricao ?? startup.descricao,
      estagio: dto.estagio ?? startup.estagio,
      investimentoPretendido:
        dto.investimentoPretendido ?? startup.investimentoPretendido,
      cidade: dto.cidade ?? startup.cidade,
      uf: dto.uf ? dto.uf.toUpperCase() : startup.uf,
      segmentos: startup.segmentos,
    });

    return this.startupRepository.save(startup);
  }
}
