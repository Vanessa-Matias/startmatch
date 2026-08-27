// main.ts
// =========
// Ponto de entrada da API: sobe a aplicação Nest, liga validação global de
// DTOs, o filtro de exceções padronizado, CORS e a documentação Swagger
// (disponível em /docs). Configuração de processo — não de domínio — mora
// aqui; regras de negócio ficam nos módulos em src/modules.
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AppConfig } from './config/configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<AppConfig, true>);
  const appConfig = configService.get('app', { infer: true });
  const corsConfig = configService.get('cors', { infer: true });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors({ origin: corsConfig.origin });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('StartMatch API')
    .setDescription(
      'API REST do StartMatch — matchmaking entre startups, investidores e mentores.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(appConfig.port);
}
void bootstrap();
