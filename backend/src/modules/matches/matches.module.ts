// matches.module.ts
// ====================
// Importa as entidades de Startup/Investidor/Conversa direto (em vez dos
// módulos inteiros) porque só precisa dos repositórios para o cálculo de
// score e para criar a Conversa do match — evita dependência circular com
// StartupsModule/InvestorsModule (que dependeriam de volta via interests).
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from './entities/match.entity';
import { Conversa } from '../conversations/entities/conversa.entity';
import { Startup } from '../startups/entities/startup.entity';
import { Investidor } from '../investors/entities/investidor.entity';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Match, Conversa, Startup, Investidor])],
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService],
})
export class MatchesModule {}
