// investors.module.ts
// ======================
// Exporta InvestorsService pelo mesmo motivo de startups.module.ts: matches
// e admin leem dados de investidor sem precisar do módulo inteiro.
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Investidor } from './entities/investidor.entity';
import { InvestidorSegmento } from './entities/investidor-segmento.entity';
import { InvestorsService } from './investors.service';
import { InvestorsController } from './investors.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Investidor, InvestidorSegmento])],
  controllers: [InvestorsController],
  providers: [InvestorsService],
  exports: [InvestorsService],
})
export class InvestorsModule {}
