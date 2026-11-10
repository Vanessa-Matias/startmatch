import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ModalidadeMentoria } from '../../../common/enums';

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

  // Duração de cada mentoria: 30 min ou 1 hora.
  @IsOptional()
  @Type(() => Number)
  @IsIn([30, 60], { message: 'A duração deve ser 30 ou 60 minutos.' })
  duracaoMinutos?: number;

  // Quantas mentorias por mês o mentor aceita.
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(30)
  mentoriasPorMes?: number;

  @IsOptional()
  @IsEnum(ModalidadeMentoria, {
    message: 'Modalidade inválida. Use presencial, hibrido ou remoto.',
  })
  modalidade?: ModalidadeMentoria;
}
