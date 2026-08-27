import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Startup } from './startup.entity';
import { Segmento } from '../../segments/entities/segmento.entity';

@Entity('startup_segmento')
@Index(['startup', 'segmento'], { unique: true })
export class StartupSegmento {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Startup, (startup) => startup.segmentos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  startup: Startup;

  @ManyToOne(() => Segmento, (segmento) => segmento.startupSegmentos, {
    eager: true,
  })
  @JoinColumn()
  segmento: Segmento;

  @Column({ default: false })
  principal: boolean;
}
