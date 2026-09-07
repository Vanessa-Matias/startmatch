import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Startup } from '../../startups/entities/startup.entity';

// Business Model Canvas completo (9 blocos), 1:1 com Startup. Os nomes dos
// campos espelham exatamente os ids usados no formulário da tela `canvas/`
// no frontend (frontend/src/pages/canvas/index.html) — mudar um nome aqui
// exige mudar o mesmo nome lá (e em UpsertBusinessCanvasDto /
// BusinessCanvasResponseDto / PlanoNegocio no frontend).
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

  // 01 - Proposta de Valor
  @Column({ type: 'text', default: '' })
  propostaValor: string;

  // 02 - Segmentos de Clientes
  @Column({ type: 'text', default: '' })
  segmentosClientes: string;

  // 03 - Canais
  @Column({ type: 'text', default: '' })
  canais: string;

  // 04 - Relacionamento com Clientes
  @Column({ type: 'text', default: '' })
  relacionamentoClientes: string;

  // 05 - Fontes de Receita
  @Column({ type: 'text', default: '' })
  fontesReceita: string;

  // 06 - Recursos-Chave
  @Column({ type: 'text', default: '' })
  recursosChave: string;

  // 07 - Atividades-Chave
  @Column({ type: 'text', default: '' })
  atividadesChave: string;

  // 08 - Parcerias-Chave
  @Column({ type: 'text', default: '' })
  parceriasChave: string;

  // 09 - Estrutura de Custos
  @Column({ type: 'text', default: '' })
  estruturaCustos: string;

  @UpdateDateColumn()
  atualizadoEm: Date;
}
