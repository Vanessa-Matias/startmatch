// lgpd.service.ts
// ==================
// Só cria/lista consentimentos — sem update nem delete, porque cada aceite é
// um registro histórico imutável (evidência de consentimento numa data/versão
// do termo), não um estado que se sobrescreve.
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConsentimentoLgpd } from './entities/consentimento-lgpd.entity';
import { CreateConsentDto } from './dto/create-consent.dto';

@Injectable()
export class LgpdService {
  constructor(
    @InjectRepository(ConsentimentoLgpd)
    private readonly consentimentoRepository: Repository<ConsentimentoLgpd>,
  ) {}

  async register(
    usuarioId: number,
    dto: CreateConsentDto,
  ): Promise<ConsentimentoLgpd> {
    const consentimento = this.consentimentoRepository.create({
      usuarioId,
      ...dto,
    });
    return this.consentimentoRepository.save(consentimento);
  }

  async findByUser(usuarioId: number): Promise<ConsentimentoLgpd[]> {
    return this.consentimentoRepository.find({
      where: { usuarioId },
      order: { criadoEm: 'DESC' },
    });
  }
}
