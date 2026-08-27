// beta-evaluation.service.ts
// =============================
// CRUD mínimo (só create + list) — cada avaliação é um registro independente,
// sem edição posterior nem vínculo com outras entidades além do usuário que
// respondeu.
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AvaliacaoBeta } from './entities/avaliacao-beta.entity';
import { CreateBetaEvaluationDto } from './dto/create-beta-evaluation.dto';

@Injectable()
export class BetaEvaluationService {
  constructor(
    @InjectRepository(AvaliacaoBeta)
    private readonly avaliacaoRepository: Repository<AvaliacaoBeta>,
  ) {}

  async create(
    usuarioId: number,
    dto: CreateBetaEvaluationDto,
  ): Promise<AvaliacaoBeta> {
    const avaliacao = this.avaliacaoRepository.create({ usuarioId, ...dto });
    return this.avaliacaoRepository.save(avaliacao);
  }

  async findAll(): Promise<AvaliacaoBeta[]> {
    return this.avaliacaoRepository.find({ order: { criadoEm: 'DESC' } });
  }
}
