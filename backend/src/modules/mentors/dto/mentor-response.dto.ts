import { Exclude, Expose, Transform } from 'class-transformer';
import { ModalidadeMentoria } from '../../../common/enums';

@Exclude()
export class MentorResponseDto {
  @Expose()
  id: number;

  // Id do usuário dono do perfil (usado para iniciar conversa direta).
  @Expose()
  usuarioId: number;

  // Nome do usuário dono do perfil (vem da relação "usuario").
  @Expose()
  @Transform(
    ({ obj }: { obj: { usuario?: { nome?: string } } }) => obj.usuario?.nome,
  )
  nome?: string;

  @Expose()
  areaAtuacao: string;

  @Expose()
  bio: string;

  @Expose()
  especialidades: string[];

  @Expose()
  vinculoPortoDigital: boolean;

  // Dias e horários em que o mentor atende.
  @Expose()
  disponibilidade: string;

  @Expose()
  duracaoMinutos: number;

  @Expose()
  mentoriasPorMes: number;

  @Expose()
  modalidade: ModalidadeMentoria;
}
