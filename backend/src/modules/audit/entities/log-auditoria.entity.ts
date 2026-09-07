// log-auditoria.entity.ts
// ==========================
// Registro de auditoria (2ª entrega — "registro básico de auditoria" e a tela
// admin-auditoria do frontend, que já tem toda a UI pronta e só esperava dados
// reais). Cada linha é um evento identificado (sempre ligado a um usuário —
// não registramos eventos anônimos) com resultado (sucesso/falha/pendente).
// É só histórico, não tem update nem delete.
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TipoEventoAuditoria, ResultadoAuditoria } from '../../../common/enums';
import { Usuario } from '../../users/entities/usuario.entity';

@Entity('log_auditoria')
export class LogAuditoria {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn()
  usuario: Usuario;

  @Column()
  usuarioId: number;

  @Column({ type: 'enum', enum: TipoEventoAuditoria })
  tipoEvento: TipoEventoAuditoria;

  // Rótulo legível do evento (ex.: "Login", "Cadastro de conta").
  @Column()
  evento: string;

  // Descrição curta da ação (ex.: "Login realizado", "Perfil de mentor criado").
  @Column()
  acao: string;

  @Column({ type: 'enum', enum: ResultadoAuditoria })
  resultado: ResultadoAuditoria;

  // Origem do evento — hoje sempre "Web" (só existe um cliente); campo já
  // pronto para diferenciar origem se um dia existir outro canal (ex.: API
  // pública, app mobile).
  @Column({ default: 'Web' })
  origem: string;

  @CreateDateColumn()
  criadoEm: Date;
}
