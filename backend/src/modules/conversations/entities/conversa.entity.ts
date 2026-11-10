import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Match } from '../../matches/entities/match.entity';
import { Mensagem } from './mensagem.entity';

// Uma conversa é de um destes dois tipos:
//   - de MATCH: matchId preenchido (startup e investidor depois do match);
//   - DIRETA: matchId vazio; um mentor conversa com uma startup ou investidor
//     (networking do mentor, sem precisar de match). Os dois usuários ficam em
//     mentorUsuarioId e contraparteUsuarioId.
@Entity('conversa')
@Index(['mentorUsuarioId', 'contraparteUsuarioId'], { unique: true })
export class Conversa {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Match, (match) => match.conversa, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn()
  match: Match | null;

  @Column({ type: 'int', unique: true, nullable: true })
  matchId: number | null;

  @Column({ type: 'int', nullable: true })
  mentorUsuarioId: number | null;

  @Column({ type: 'int', nullable: true })
  contraparteUsuarioId: number | null;

  @CreateDateColumn()
  criadaEm: Date;

  @OneToMany(() => Mensagem, (mensagem) => mensagem.conversa)
  mensagens?: Mensagem[];
}
