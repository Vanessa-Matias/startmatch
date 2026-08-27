// startups.module.ts
// =====================
// Exporta StartupsService porque outros módulos precisam ler dados de
// startup sem depender do módulo inteiro — matches (score de compatibilidade)
// e admin (métricas) são os principais consumidores.
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Startup } from './entities/startup.entity';
import { StartupSegmento } from './entities/startup-segmento.entity';
import { StartupsService } from './startups.service';
import { StartupsController } from './startups.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Startup, StartupSegmento])],
  controllers: [StartupsController],
  providers: [StartupsService],
  exports: [StartupsService],
})
export class StartupsModule {}
