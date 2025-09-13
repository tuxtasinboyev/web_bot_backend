import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['https://salomnn.netlify.app/login'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });


  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));
  const config = new DocumentBuilder()
    .setTitle('Web bot API')
    .setDescription('Web bot CRUD endpoints')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('web-bot')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  await app.listen(4000);
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Swagger UI running on http://localhost:${port}/api`);
}


bootstrap();


