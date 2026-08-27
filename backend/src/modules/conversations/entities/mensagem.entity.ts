import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Conversa } from './conversa.entity';
import { Usuario } from '../../users/entities/usuario.entity';

@Entity('mensagem')
export class Mensagem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Conversa, (conversa) => conversa.mensagens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  conversa: Conversa;

  @Column()
  conversaId: number;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn()
  remetente: Usuario;

  @Column()
  remetenteId: number;

  @Column({ type: 'text' })
  conteudo: string;

  @CreateDateColumn()
  enviadaEm: Date;

  @Column({ default: false })
  lida: boolean;
}
