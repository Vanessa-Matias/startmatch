//Este é o arquivo que liga a API
// aqui; regras de negócio ficam nos módulos em src/modules.
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AppConfig } from './config/configuration';

async function bootstrap() {
  // >> Este arquivo liga a API (é o primeiro a rodar).
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<AppConfig, true>);
  const appConfig = configService.get('app', { infer: true });
  const corsConfig = configService.get('cors', { infer: true });

  app.setGlobalPrefix('api');
  // >> Toda rota começa com /api. Ex.: /api/startups.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  // >> Valida os dados recebidos: dado inválido é recusado.
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors({ origin: corsConfig.origin });
  // >> Libera o site (front-end) para falar com a API.

  const swaggerConfig = new DocumentBuilder()
    .setTitle('StartMatch API')
    .setDescription(
      [
        'API REST do StartMatch — matchmaking entre startups, investidores e mentores.',
        '',
        'Como usar: 1) faça POST /api/auth/login (ou /api/auth/register) para obter o accessToken; ' +
          '2) clique em "Authorize" e cole o token; 3) use "Try it out" em qualquer endpoint.',
      ].join('\n'),
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'StartMatch API — Documentação',
    swaggerOptions: { persistAuthorization: true, docExpansion: 'list' },
  });
  // >> Documentação da API (Swagger): abre em /docs.

  await app.listen(appConfig.port);
  // >> Pronto: a API está no ar, esperando pedidos.
}
void bootstrap();
