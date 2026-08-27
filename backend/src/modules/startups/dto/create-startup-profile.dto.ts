import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';
import { EstagioStartup } from '../../../common/enums';
import { SegmentoSelecaoDto } from './segmento-selecao.dto';

export class CreateStartupProfileDto {
  @IsNotEmpty()
  nomeFantasia: string;

  @IsOptional()
  @IsString()
  cnpj?: string;

  @IsNotEmpty()
  descricao: string;

  @IsEnum(EstagioStartup)
  estagio: EstagioStartup;

  @ValidateNested({ each: true })
  @Type(() => SegmentoSelecaoDto)
  @ArrayMinSize(1)
  segmentos: SegmentoSelecaoDto[];

  @IsNumber()
  @Min(0)
  investimentoPretendido: number;

  @IsNotEmpty()
  cidade: string;

  @Length(2, 2)
  uf: string;
}
