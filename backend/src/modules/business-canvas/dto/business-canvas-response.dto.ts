import { Exclude, Expose } from 'class-transformer';

// Resposta de GET/PUT /business-canvas/me — os 9 blocos do Business Model
// Canvas. Nomes dos campos espelham os ids do formulário em
// frontend/src/pages/canvas/index.html.
@Exclude()
export class BusinessCanvasResponseDto {
  @Expose()
  propostaValor: string;

  @Expose()
  segmentosClientes: string;

  @Expose()
  canais: string;

  @Expose()
  relacionamentoClientes: string;

  @Expose()
  fontesReceita: string;

  @Expose()
  recursosChave: string;

  @Expose()
  atividadesChave: string;

  @Expose()
  parceriasChave: string;

  @Expose()
  estruturaCustos: string;

  @Expose()
  atualizadoEm?: Date;
}
