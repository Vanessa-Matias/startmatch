import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { AppConfig } from './configuration';

export const buildDatabaseConfig = (
  configService: ConfigService<AppConfig, true>,
): TypeOrmModuleOptions => {
  const database = configService.get('database', { infer: true });
  const nodeEnv = configService.get('app', { infer: true }).nodeEnv;

  const isLocalHost = ['localhost', '127.0.0.1'].includes(database.host);

  return {
    type: 'postgres',
    host: database.host,
    port: database.port,
    username: database.username,
    password: database.password,
    database: database.name,
    autoLoadEntities: true,
    // TODO: trocar por migrations (`npm run migration:run`) antes de qualquer deploy real.
    // synchronize=true só é seguro em desenvolvimento local.
    synchronize: nodeEnv === 'development',
    namingStrategy: new SnakeNamingStrategy(),
    // Conexões diretas do Supabase (e provedores gerenciados em geral) exigem SSL.
    ssl: isLocalHost ? undefined : { rejectUnauthorized: false },
  };
};
