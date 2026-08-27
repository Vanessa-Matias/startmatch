import { IsInt } from 'class-validator';

export class CreateInterestDto {
  @IsInt()
  contraparteId: number;
}
