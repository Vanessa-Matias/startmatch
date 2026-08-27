import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PlanoAssinatura, TipoInvestidor } from '../../../common/enums';
import { Usuario } from '../../users/entities/usuario.entity';
import { InvestidorSegmento } from './investidor-segmento.entity';
import { Interesse } from '../../interests/entities/interesse.entity';
import { Match } from '../../matches/entities/match.entity';

@Entity('investidor')
export class Investidor {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn()
  usuario: Usuario;

  @Column({ unique: true })
  usuarioId: number;

  @Column({ type: 'enum', enum: TipoInvestidor })
  tipo: TipoInvestidor;

  @Column({ type: 'text' })
  teseInvestimento: string;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  investimentoMin: number;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  investimentoMax: number;

  @Column()
  cidade: string;

  @Column({ length: 2 })
  uf: string;

  @Column({ default: true })
  perfilPublico: boolean;

  @Column({
    type: 'enum',
    enum: PlanoAssinatura,
    default: PlanoAssinatura.BASICO,
  })
  planoAssinatura: PlanoAssinatura;

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;

  @OneToMany(
    () => InvestidorSegmento,
    (investidorSegmento) => investidorSegmento.investidor,
    {
      cascade: true,
    },
  )
  segmentos: InvestidorSegmento[];

  @OneToMany(() => Interesse, (interesse) => interesse.investidor)
  interesses?: Interesse[];

  @OneToMany(() => Match, (match) => match.investidor)
  matches?: Match[];
}
