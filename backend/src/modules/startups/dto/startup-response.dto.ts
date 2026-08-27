import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { EstagioStartup, PlanoAssinatura } from '../../../common/enums';
import type { StartupSegmento } from '../entities/startup-segmento.entity';

@Exclude()
class SegmentoSelecionadoResponseDto {
  @Expose()
  @Transform(({ obj }: { obj: StartupSegmento }) => obj.segmento?.id)
  segmentoId: number;

  @Expose()
  @Transform(({ obj }: { obj: StartupSegmento }) => obj.segmento?.nome)
  nome: string;

  @Expose()
  principal: boolean;
}

@Exclude()
export class StartupResponseDto {
  @Expose()
  id: number;

  @Expose()
  nomeFantasia: string;

  @Expose()
  cnpj?: string;

  @Expose()
  descricao: string;

  @Expose()
  estagio: EstagioStartup;

  @Expose()
  investimentoPretendido: number;

  @Expose()
  cidade: string;

  @Expose()
  uf: string;

  @Expose()
  planoAssinatura: PlanoAssinatura;

  @Expose()
  @Type(() => SegmentoSelecionadoResponseDto)
  segmentos: SegmentoSelecionadoResponseDto[];
}
