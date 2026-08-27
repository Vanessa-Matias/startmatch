// segments.module.ts
// =====================
// Exporta SegmentsService porque startups/investors referenciam Segmento nas
// suas próprias entidades N:N (StartupSegmento, InvestidorSegmento).
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Segmento } from './entities/segmento.entity';
import { SegmentsService } from './segments.service';
import { SegmentsController } from './segments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Segmento])],
  controllers: [SegmentsController],
  providers: [SegmentsService],
  exports: [SegmentsService],
})
export class SegmentsModule {}
