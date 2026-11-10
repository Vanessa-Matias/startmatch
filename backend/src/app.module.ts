//Este é o módulo principal. Ele lê as configurações do .env e conecta no banco.
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
import { MentoriasModule } from './modules/mentorias/mentorias.module';
import { InterestsModule } from './modules/interests/interests.module';
import { MatchesModule } from './modules/matches/matches.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { BusinessCanvasModule } from './modules/business-canvas/business-canvas.module';
import { LgpdModule } from './modules/lgpd/lgpd.module';
import { BetaEvaluationModule } from './modules/beta-evaluation/beta-evaluation.module';
import { AdminModule } from './modules/admin/admin.module';
import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    // >> Lê as configurações do .env 
    // >> AQUI a API se conecta ao banco. Detalhes: config/database.config.ts.
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig, true>) =>
        buildDatabaseConfig(configService),
    }),
    // >> Abaixo: os módulos do sistema (login, startups, investidores, matches...).
    AuthModule,
    UsersModule,
    SegmentsModule,
    StartupsModule,
    InvestorsModule,
    MentorsModule,
    MentoriasModule,
    InterestsModule,
    MatchesModule,
    ConversationsModule,
    BusinessCanvasModule,
    LgpdModule,
    BetaEvaluationModule,
    AuditModule,
    AdminModule,
  ],
})
export class AppModule {}
