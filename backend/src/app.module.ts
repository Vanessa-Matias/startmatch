// app.module.ts
// ===============
// Módulo raiz da API: liga a configuração de ambiente (.env, validada por
// validation.schema.ts), a conexão com o PostgreSQL via TypeORM, e registra
// todos os módulos de domínio — um por recurso do negócio (auth, users,
// startups, investors, mentors, segments, interests, matches, conversations,
// business-canvas, lgpd, beta-evaluation, admin).
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { validationSchema } from './config/validation.schema';
import { buildDatabaseConfig } from './config/database.config';
import { AppConfig } from './config/configuration';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SegmentsModule } from './modules/segments/segments.module';
import { StartupsModule } from './modules/startups/startups.module';
import { InvestorsModule } from './modules/investors/investors.module';
import { MentorsModule } from './modules/mentors/mentors.module';
import { InterestsModule } from './modules/interests/interests.module';
import { MatchesModule } from './modules/matches/matches.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { BusinessCanvasModule } from './modules/business-canvas/business-canvas.module';
import { LgpdModule } from './modules/lgpd/lgpd.module';
import { BetaEvaluationModule } from './modules/beta-evaluation/beta-evaluation.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig, true>) =>
        buildDatabaseConfig(configService),
    }),
    AuthModule,
    UsersModule,
    SegmentsModule,
    StartupsModule,
    InvestorsModule,
    MentorsModule,
    InterestsModule,
    MatchesModule,
    ConversationsModule,
    BusinessCanvasModule,
    LgpdModule,
    BetaEvaluationModule,
    AdminModule,
  ],
})
export class AppModule {}
