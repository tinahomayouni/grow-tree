import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.setBaseViewsDir(join(__dirname, 'views'));
  app.setViewEngine('ejs');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Grow API')
    .setDescription(
      'A calm plant growth simulator. Manage sunlight, water, and fertilizer to help your plant grow.',
    )
    .setVersion('1.0')
    .addTag('plant', 'Your plant — create, water, align sun, collect fertilizer')
    .addTag('world', 'World simulation — day/night, seasons, sheep')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Grow is running on http://localhost:${port}`);
  console.log(`Demo UI:  http://localhost:${port}/`);
  console.log(`Swagger:  http://localhost:${port}/api`);
}

bootstrap();
