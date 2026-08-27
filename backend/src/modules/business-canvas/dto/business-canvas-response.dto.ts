import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class BusinessCanvasResponseDto {
  @Expose()
  propostaValor: string;

  @Expose()
  modeloReceita: string;

  @Expose()
  publicoAlvo: string;

  @Expose()
  estrategiaMonetizacao: string;

  @Expose()
  atualizadoEm?: Date;
}
