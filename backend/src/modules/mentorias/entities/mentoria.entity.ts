import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StatusMentoria } from '../../../common/enums';
import { Mentor } from '../../mentors/entities/mentor.entity';
import { Startup } from '../../startups/entities/startup.entity';

// Uma mentoria agendada: a startup escolhe um mentor, um dia e um horário; o
// mentor aceita ou recusa; depois de acontecer, o mentor marca como realizada e
// o sistema gera o código do certificado.
@Entity('mentoria')
@Index(['mentorId', 'dataHora'])
export class Mentoria {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Mentor, { onDelete: 'CASCADE' })
  @JoinColumn()
  mentor: Mentor;

  @Column()
  mentorId: number;

  @ManyToOne(() => Startup, { onDelete: 'CASCADE' })
  @JoinColumn()
  startup: Startup;

  @Column()
  startupId: number;

  // Dia e horário combinados para a mentoria.
  @Column({ type: 'timestamptz' })
  dataHora: Date;

  @Column()
  tema: string;

  @Column({ type: 'text', default: '' })
  mensagem: string;

  @Column({
    type: 'enum',
    enum: StatusMentoria,
    default: StatusMentoria.PENDENTE,
  })
  status: StatusMentoria;

  // Só existe depois que a mentoria é marcada como realizada.
  @Column({ type: 'varchar', unique: true, nullable: true })
  codigoCertificado: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  realizadaEm: Date | null;

  @CreateDateColumn()
  criadoEm: Date;
}
