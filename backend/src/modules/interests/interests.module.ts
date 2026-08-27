// interests.module.ts
// ======================
// Depende de StartupsModule/InvestorsModule (resolver quem é quem a partir
// do usuário logado) e de MatchesModule (criar o Match quando o interesse
// vira mútuo).
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Interesse } from './entities/interesse.entity';
import { InterestsService } from './interests.service';
import { InterestsController } from './interests.controller';
import { StartupsModule } from '../startups/startups.module';
import { InvestorsModule } from '../investors/investors.module';
import { MatchesModule } from '../matches/matches.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Interesse]),
    StartupsModule,
    InvestorsModule,
    MatchesModule,
  ],
  controllers: [InterestsController],
  providers: [InterestsService],
  exports: [InterestsService],
})
export class InterestsModule {}
