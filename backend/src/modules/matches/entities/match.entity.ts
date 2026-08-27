import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Startup } from '../../startups/entities/startup.entity';
import { Investidor } from '../../investors/entities/investidor.entity';
import { Conversa } from '../../conversations/entities/conversa.entity';

@Entity('match')
@Index(['startup', 'investidor'], { unique: true })
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Startup, (startup) => startup.matches, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  startup: Startup;

  @Column()
  startupId: number;

  @ManyToOne(() => Investidor, (investidor) => investidor.matches, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  investidor: Investidor;

  @Column()
  investidorId: number;

  @Column()
  scoreCompatibilidade: number;

  @CreateDateColumn()
  criadoEm: Date;

  @OneToOne(() => Conversa, (conversa) => conversa.match)
  conversa?: Conversa;
}
