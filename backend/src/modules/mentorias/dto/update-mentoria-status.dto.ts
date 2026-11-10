import { IsIn } from 'class-validator';
import { StatusMentoria } from '../../../common/enums';

// O mentor usa aceita, recusada e realizada. A startup usa cancelada.
export class UpdateMentoriaStatusDto {
  @IsIn([
    StatusMentoria.ACEITA,
    StatusMentoria.RECUSADA,
    StatusMentoria.REALIZADA,
    StatusMentoria.CANCELADA,
  ])
  status: StatusMentoria;
}
