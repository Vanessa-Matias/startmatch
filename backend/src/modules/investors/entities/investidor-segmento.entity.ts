import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Investidor } from './investidor.entity';
import { Segmento } from '../../segments/entities/segmento.entity';

@Entity('investidor_segmento')
@Index(['investidor', 'segmento'], { unique: true })
export class InvestidorSegmento {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Investidor, (investidor) => investidor.segmentos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  investidor: Investidor;

  @ManyToOne(() => Segmento, (segmento) => segmento.investidorSegmentos, {
    eager: true,
  })
  @JoinColumn()
  segmento: Segmento;

  @Column({ default: 1 })
  prioridade: number;
}
