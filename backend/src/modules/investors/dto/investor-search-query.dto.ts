import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class InvestorSearchQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  segmentoId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  investimentoMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  investimentoMax?: number;

  @IsOptional()
  @Length(2, 2)
  uf?: string;

  @IsOptional()
  @IsString()
  texto?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 12;
}
