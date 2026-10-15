import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { PlanoAssinatura, TipoInvestidor } from '../../../common/enums';
import type { InvestidorSegmento } from '../entities/investidor-segmento.entity';

@Exclude()
class SegmentoPrioridadeResponseDto {
  @Expose()
  @Transform(({ obj }: { obj: InvestidorSegmento }) => obj.segmento?.id)
  segmentoId: number;

  @Expose()
  @Transform(({ obj }: { obj: InvestidorSegmento }) => obj.segmento?.nome)
  nome: string;

  @Expose()
  prioridade: number;
}

@Exclude()
export class InvestorResponseDto {
  @Expose()
  id: number;

  // Nome do usuário dono do perfil (vem da relação "usuario").
  @Expose()
  @Transform(({ obj }: { obj: { usuario?: { nome?: string } } }) => obj.usuario?.nome)
  nome?: string;

  @Expose()
  tipo: TipoInvestidor;

  @Expose()
  teseInvestimento: string;

  @Expose()
  investimentoMin: number;

  @Expose()
  investimentoMax: number;

  @Expose()
  cidade: string;

  @Expose()
  uf: string;

  @Expose()
  perfilPublico: boolean;

  @Expose()
  planoAssinatura: PlanoAssinatura;

  @Expose()
  @Type(() => SegmentoPrioridadeResponseDto)
  segmentos: SegmentoPrioridadeResponseDto[];
}
