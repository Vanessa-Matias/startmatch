// segments.service.ts
// ======================
// Leitura simples da tabela de segmentos, ordenada por nome. Sem create/
// update/delete porque a lista é mantida via seed, não pela API.
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Segmento } from './entities/segmento.entity';

@Injectable()
export class SegmentsService {
  constructor(
    @InjectRepository(Segmento)
    private readonly segmentoRepository: Repository<Segmento>,
  ) {}

  async findAll(): Promise<Segmento[]> {
    return this.segmentoRepository.find({ order: { nome: 'ASC' } });
  }
}
