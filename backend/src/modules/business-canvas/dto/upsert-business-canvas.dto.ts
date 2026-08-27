import { IsString } from 'class-validator';

export class UpsertBusinessCanvasDto {
  @IsString()
  propostaValor: string;

  @IsString()
  modeloReceita: string;

  @IsString()
  publicoAlvo: string;

  @IsString()
  estrategiaMonetizacao: string;
}
