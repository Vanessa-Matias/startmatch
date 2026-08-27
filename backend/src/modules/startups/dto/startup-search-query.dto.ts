import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { EstagioStartup } from '../../../common/enums';

export class StartupSearchQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  segmentoId?: number;

  @IsOptional()
  @IsEnum(EstagioStartup)
  estagio?: EstagioStartup;

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
