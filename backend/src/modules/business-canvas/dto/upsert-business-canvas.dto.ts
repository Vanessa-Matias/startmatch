import { IsString } from 'class-validator';

// Payload de PUT /business-canvas/me — os 9 blocos do Business Model Canvas.
// Nomes dos campos espelham os ids do formulário em
// frontend/src/pages/canvas/index.html.
export class UpsertBusinessCanvasDto {
  @IsString()
  propostaValor: string;

  @IsString()
  segmentosClientes: string;

  @IsString()
  canais: string;

  @IsString()
  relacionamentoClientes: string;

  @IsString()
  fontesReceita: string;

  @IsString()
  recursosChave: string;

  @IsString()
  atividadesChave: string;

  @IsString()
  parceriasChave: string;

  @IsString()
  estruturaCustos: string;
}
