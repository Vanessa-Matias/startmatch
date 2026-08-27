// beta-evaluation.module.ts
// ============================
// Módulo isolado, sem dependência de outros domínios — só grava a avaliação
// vinculada ao usuarioId de quem respondeu.
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvaliacaoBeta } from './entities/avaliacao-beta.entity';
import { BetaEvaluationService } from './beta-evaluation.service';
import { BetaEvaluationController } from './beta-evaluation.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AvaliacaoBeta])],
  controllers: [BetaEvaluationController],
  providers: [BetaEvaluationService],
  exports: [BetaEvaluationService],
})
export class BetaEvaluationModule {}
