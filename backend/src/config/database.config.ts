//Aqui está a o arquivo responsável pela conexão com o banco de dados.
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { AppConfig } from './configuration';

export const buildDatabaseConfig = (
  configService: ConfigService<AppConfig, true>,
): TypeOrmModuleOptions => {
  // >> Aqui monta a conexão da API com o banco de dados.
  const database = configService.get('database', { infer: true });
  const nodeEnv = configService.get('app', { infer: true }).nodeEnv;

  const isLocalHost = ['localhost', '127.0.0.1'].includes(database.host);

  return {
    type: 'postgres',
    // >> Banco usado: PostgreSQL 
    host: database.host,
    port: database.port,
    username: database.username,
    password: database.password,
    database: database.name,
    autoLoadEntities: true,
    synchronize: nodeEnv === 'development',
    namingStrategy: new SnakeNamingStrategy(),
    // Conexões diretas do Supabase
    ssl: isLocalHost ? undefined : { rejectUnauthorized: false },
  };
};
