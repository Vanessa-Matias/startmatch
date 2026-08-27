// business-canvas.module.ts
// ============================
// Importa a entidade Startup direto (não StartupsModule inteiro) só para
// resolver o startupId do usuário logado antes de ler/gravar o PlanoNegocio.
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanoNegocio } from './entities/plano-negocio.entity';
import { Startup } from '../startups/entities/startup.entity';
import { BusinessCanvasService } from './business-canvas.service';
import { BusinessCanvasController } from './business-canvas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PlanoNegocio, Startup])],
  controllers: [BusinessCanvasController],
  providers: [BusinessCanvasService],
  exports: [BusinessCanvasService],
})
export class BusinessCanvasModule {}
