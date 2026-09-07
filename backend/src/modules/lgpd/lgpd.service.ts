// lgpd.service.ts
// ==================
// Só cria/lista consentimentos — sem update nem delete, porque cada aceite é
// um registro histórico imutável (evidência de consentimento numa data/versão
// do termo), não um estado que se sobrescreve. Cada registro de consentimento
// também gera um evento de auditoria (ver modules/audit).
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConsentimentoLgpd } from './entities/consentimento-lgpd.entity';
import { CreateConsentDto } from './dto/create-consent.dto';
import { AuditService } from '../audit/audit.service';
import { TipoEventoAuditoria, ResultadoAuditoria } from '../../common/enums';

@Injectable()
export class LgpdService {
  constructor(
    @InjectRepository(ConsentimentoLgpd)
    private readonly consentimentoRepository: Repository<ConsentimentoLgpd>,
    private readonly auditService: AuditService,
  ) {}

  async register(
    usuarioId: number,
    dto: CreateConsentDto,
  ): Promise<ConsentimentoLgpd> {
    const consentimento = this.consentimentoRepository.create({
      usuarioId,
      ...dto,
    });
    const salvo = await this.consentimentoRepository.save(consentimento);

    await this.auditService.registrar({
      usuarioId,
      tipoEvento: TipoEventoAuditoria.LGPD,
      evento: 'Consentimento LGPD',
      acao: `Consentimento de "${dto.tipoConsentimento}" ${dto.aceito ? 'aceito' : 'recusado'}`,
      resultado: ResultadoAuditoria.SUCESSO,
    });

    return salvo;
  }

  async findByUser(usuarioId: number): Promise<ConsentimentoLgpd[]> {
    return this.consentimentoRepository.find({
      where: { usuarioId },
      order: { criadoEm: 'DESC' },
    });
  }

  // Contagem agregada de consentimentos por tipo — usada pelo painel
  // administrativo (GET /admin/lgpd-summary, tela admin-lgpd). Simples: só
  // contagens diretas, sem série histórica.
  async countByTipo(): Promise<Record<string, number>> {
    const linhas: { tipo_consentimento: string; total: string }[] =
      await this.consentimentoRepository
        .createQueryBuilder('c')
        .select('c.tipoConsentimento', 'tipo_consentimento')
        .addSelect('COUNT(*)', 'total')
        .where('c.aceito = true')
        .groupBy('c.tipoConsentimento')
        .getRawMany();

    return Object.fromEntries(
      linhas.map((linha) => [linha.tipo_consentimento, Number(linha.total)]),
    );
  }

  async countTotal(): Promise<number> {
    return this.consentimentoRepository.count({ where: { aceito: true } });
  }
}
