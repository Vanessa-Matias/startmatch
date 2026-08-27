import { IsInt, Min } from 'class-validator';

export class SegmentoPrioridadeDto {
  @IsInt()
  segmentoId: number;

  @IsInt()
  @Min(1)
  prioridade: number;
}
