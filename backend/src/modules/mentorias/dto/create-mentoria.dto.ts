import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateMentoriaDto {
  @Type(() => Number)
  @IsInt()
  mentorId: number;

  // Data e hora no formato ISO (ex.: 2026-11-20T14:00:00.000Z).
  @IsDateString()
  dataHora: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  tema: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  mensagem?: string;
}
