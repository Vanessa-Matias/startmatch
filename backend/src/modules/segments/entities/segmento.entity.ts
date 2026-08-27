import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { StartupSegmento } from '../../startups/entities/startup-segmento.entity';
import { InvestidorSegmento } from '../../investors/entities/investidor-segmento.entity';

@Entity('segmento')
export class Segmento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  descricao?: string;

  @OneToMany(
    () => StartupSegmento,
    (startupSegmento) => startupSegmento.segmento,
  )
  startupSegmentos?: StartupSegmento[];

  @OneToMany(
    () => InvestidorSegmento,
    (investidorSegmento) => investidorSegmento.segmento,
  )
  investidorSegmentos?: InvestidorSegmento[];
}
