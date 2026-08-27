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
import { EstagioStartup, PlanoAssinatura } from '../../../common/enums';
import { Usuario } from '../../users/entities/usuario.entity';
import { StartupSegmento } from './startup-segmento.entity';
import { Interesse } from '../../interests/entities/interesse.entity';
import { Match } from '../../matches/entities/match.entity';
import { PlanoNegocio } from '../../business-canvas/entities/plano-negocio.entity';

@Entity('startup')
export class Startup {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn()
  usuario: Usuario;

  @Column({ unique: true })
  usuarioId: number;

  @Column()
  nomeFantasia: string;

  @Column({ nullable: true })
  cnpj?: string;

  @Column({ type: 'text' })
  descricao: string;

  @Column({ type: 'enum', enum: EstagioStartup })
  estagio: EstagioStartup;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  investimentoPretendido: number;

  @Column()
  cidade: string;

  @Column({ length: 2 })
  uf: string;

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
    () => StartupSegmento,
    (startupSegmento) => startupSegmento.startup,
    {
      cascade: true,
    },
  )
  segmentos: StartupSegmento[];

  @OneToMany(() => Interesse, (interesse) => interesse.startup)
  interesses?: Interesse[];

  @OneToMany(() => Match, (match) => match.startup)
  matches?: Match[];

  @OneToOne(() => PlanoNegocio, (planoNegocio) => planoNegocio.startup)
  planoNegocio?: PlanoNegocio;
}
