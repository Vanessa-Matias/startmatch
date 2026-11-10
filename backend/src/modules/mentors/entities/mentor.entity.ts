import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ModalidadeMentoria } from '../../../common/enums';
import { Usuario } from '../../users/entities/usuario.entity';

@Entity('mentor')
export class Mentor {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn()
  usuario: Usuario;

  @Column({ unique: true })
  usuarioId: number;

  @Column()
  areaAtuacao: string;

  @Column({ type: 'text' })
  bio: string;

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  especialidades: string[];

  @Column({ default: false })
  vinculoPortoDigital: boolean;

  // Dias e horários em texto livre (ex.: "Seg e qua, 14h às 18h").
  @Column({ type: 'text' })
  disponibilidade: string;

  // Duração de cada mentoria, em minutos (30 ou 60).
  @Column({ type: 'int', default: 60 })
  duracaoMinutos: number;

  // Quantas mentorias o mentor aceita por mês (limite de agenda dele).
  @Column({ type: 'int', default: 4 })
  mentoriasPorMes: number;

  @Column({
    type: 'enum',
    enum: ModalidadeMentoria,
    default: ModalidadeMentoria.REMOTO,
  })
  modalidade: ModalidadeMentoria;

  // O mentor é voluntário e NÃO paga assinatura (modelo de negócio novo): a
  // coluna antiga plano_assinatura deixou de existir.

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;
}
