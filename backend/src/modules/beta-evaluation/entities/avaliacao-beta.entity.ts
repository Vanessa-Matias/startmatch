import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Usuario } from '../../users/entities/usuario.entity';

@Entity('avaliacao_beta')
export class AvaliacaoBeta {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.avaliacoesBeta, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  usuario?: Usuario;

  @Column({ nullable: true })
  usuarioId?: number;

  @Column({ type: 'int' })
  nota: number;

  @Column({ type: 'text', nullable: true })
  comentario?: string;

  @CreateDateColumn()
  criadoEm: Date;
}
