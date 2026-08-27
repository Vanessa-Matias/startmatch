import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TipoConsentimento } from '../../../common/enums';
import { Usuario } from '../../users/entities/usuario.entity';

@Entity('consentimento_lgpd')
export class ConsentimentoLgpd {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.consentimentos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  usuario: Usuario;

  @Column()
  usuarioId: number;

  @Column({ type: 'enum', enum: TipoConsentimento })
  tipoConsentimento: TipoConsentimento;

  @Column()
  aceito: boolean;

  @Column()
  versaoDocumento: string;

  @CreateDateColumn()
  criadoEm: Date;
}
