import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { TipoEventoAuditoria } from '../../../common/enums';

export class AuditLogQueryDto {
  @IsOptional()
  @IsEnum(TipoEventoAuditoria)
  tipo?: TipoEventoAuditoria;

  // Busca livre por nome ou e-mail do usuário do evento.
  @IsOptional()
  @IsString()
  usuario?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 50;
}
