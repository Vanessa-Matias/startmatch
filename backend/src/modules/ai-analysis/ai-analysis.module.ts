// Módulo da atividade de IA (análise de compatibilidade). Não tem entidade nem
// tabela: não usa banco de dados. Para remover depois da apresentação, basta
// tirar AiAnalysisModule do app.module.ts e apagar esta pasta.
import { Module } from '@nestjs/common';
import { AiAnalysisController } from './ai-analysis.controller';
import { AiAnalysisService } from './ai-analysis.service';

@Module({
  controllers: [AiAnalysisController],
  providers: [AiAnalysisService],
})
export class AiAnalysisModule {}
