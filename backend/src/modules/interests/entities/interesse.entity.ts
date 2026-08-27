import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrigemInteresse } from '../../../common/enums';
import { Startup } from '../../startups/entities/startup.entity';
import { Investidor } from '../../investors/entities/investidor.entity';

@Entity('interesse')
@Index(['startup', 'investidor', 'origem'], { unique: true })
export class Interesse {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Startup, (startup) => startup.interesses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  startup: Startup;

  @Column()
  startupId: number;

  @ManyToOne(() => Investidor, (investidor) => investidor.interesses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  investidor: Investidor;

  @Column()
  investidorId: number;

  @Column({ type: 'enum', enum: OrigemInteresse })
  origem: OrigemInteresse;

  @CreateDateColumn()
  criadoEm: Date;
}
