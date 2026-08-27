import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';
import { TipoInvestidor } from '../../../common/enums';
import { SegmentoPrioridadeDto } from './segmento-prioridade.dto';

export class CreateInvestorProfileDto {
  @IsEnum(TipoInvestidor)
  tipo: TipoInvestidor;

  @IsNotEmpty()
  teseInvestimento: string;

  @IsNumber()
  @Min(0)
  investimentoMin: number;

  @IsNumber()
  @Min(0)
  investimentoMax: number;

  @ValidateNested({ each: true })
  @Type(() => SegmentoPrioridadeDto)
  @ArrayMinSize(1)
  segmentos: SegmentoPrioridadeDto[];

  @IsNotEmpty()
  cidade: string;

  @Length(2, 2)
  uf: string;

  @IsOptional()
  @IsBoolean()
  perfilPublico?: boolean;
}
