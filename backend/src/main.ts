import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  // Chargement des certificats HTTPS depuis le dossier certs à la racine
  const httpsOptions = {
    key: fs.readFileSync(path.resolve('./certs/localhost-key.pem')),
    cert: fs.readFileSync(path.resolve('./certs/localhost.pem')),
  };

  // Création de l'app Nest avec HTTPS
  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });

  app.use(cookieParser());

  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true, 
  });

  // Configuration de Swagger
  const config = new DocumentBuilder()
    .setTitle('API Secure Messaging')
    .setDescription('Documentation API pour la messagerie sécurisée')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
