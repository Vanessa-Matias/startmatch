import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TipoUsuario } from '../../../common/enums';
import { Startup } from '../../startups/entities/startup.entity';
import { Investidor } from '../../investors/entities/investidor.entity';
import { Mentor } from '../../mentors/entities/mentor.entity';
import { ConsentimentoLgpd } from '../../lgpd/entities/consentimento-lgpd.entity';
import { AvaliacaoBeta } from '../../beta-evaluation/entities/avaliacao-beta.entity';

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column({ unique: true })
  email: string;

  @Column()
  senhaHash: string;

  @Column({ type: 'enum', enum: TipoUsuario })
  tipo: TipoUsuario;

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;

  @OneToOne(() => Startup, (startup) => startup.usuario)
  startup?: Startup;

  @OneToOne(() => Investidor, (investidor) => investidor.usuario)
  investidor?: Investidor;

  @OneToOne(() => Mentor, (mentor) => mentor.usuario)
  mentor?: Mentor;

  @OneToMany(() => ConsentimentoLgpd, (consentimento) => consentimento.usuario)
  consentimentos?: ConsentimentoLgpd[];

  @OneToMany(() => AvaliacaoBeta, (avaliacao) => avaliacao.usuario)
  avaliacoesBeta?: AvaliacaoBeta[];
}
