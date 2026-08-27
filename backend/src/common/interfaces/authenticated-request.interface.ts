import { Request } from 'express';
import { TipoUsuario } from '../enums';

export interface RequestUser {
  id: number;
  tipo: TipoUsuario;
}

export interface AuthenticatedRequest extends Request {
  user: RequestUser;
}
