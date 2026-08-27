import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateMentorProfileDto {
  @IsNotEmpty()
  areaAtuacao: string;

  @IsNotEmpty()
  bio: string;

  @IsArray()
  @ArrayMinSize(1)
  @Type(() => String)
  especialidades: string[];

  @IsOptional()
  @IsBoolean()
  vinculoPortoDigital?: boolean;

  @IsNotEmpty()
  @IsString()
  disponibilidade: string;
}
