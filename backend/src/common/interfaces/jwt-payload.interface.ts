import { TipoUsuario } from '../enums';

export interface JwtPayload {
  sub: number;
  tipo: TipoUsuario;
}
