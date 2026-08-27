import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Match } from '../../matches/entities/match.entity';
import { Mensagem } from './mensagem.entity';

@Entity('conversa')
export class Conversa {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Match, (match) => match.conversa, { onDelete: 'CASCADE' })
  @JoinColumn()
  match: Match;

  @Column({ unique: true })
  matchId: number;

  @CreateDateColumn()
  criadaEm: Date;

  @OneToMany(() => Mensagem, (mensagem) => mensagem.conversa)
  mensagens?: Mensagem[];
}
