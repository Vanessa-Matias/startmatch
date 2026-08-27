import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Startup } from '../../startups/entities/startup.entity';

@Entity('plano_negocio')
export class PlanoNegocio {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Startup, (startup) => startup.planoNegocio, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  startup: Startup;

  @Column({ unique: true })
  startupId: number;

  @Column({ type: 'text', default: '' })
  propostaValor: string;

  @Column({ type: 'text', default: '' })
  modeloReceita: string;

  @Column({ type: 'text', default: '' })
  publicoAlvo: string;

  @Column({ type: 'text', default: '' })
  estrategiaMonetizacao: string;

  @UpdateDateColumn()
  atualizadoEm: Date;
}
