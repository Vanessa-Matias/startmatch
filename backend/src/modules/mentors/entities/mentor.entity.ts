import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PlanoAssinatura } from '../../../common/enums';
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

  @Column({ type: 'text' })
  disponibilidade: string;

  @Column({
    type: 'enum',
    enum: PlanoAssinatura,
    default: PlanoAssinatura.BASICO,
  })
  planoAssinatura: PlanoAssinatura;

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;
}
