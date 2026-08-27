import { IsBoolean, IsInt } from 'class-validator';

export class SegmentoSelecaoDto {
  @IsInt()
  segmentoId: number;

  @IsBoolean()
  principal: boolean;
}
