import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as path from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();

  app.useStaticAssets(path.join(__dirname, '..', 'public'), {
    prefix: '/public/',
  });

  await app.listen(process.env.PORT ??5000);
}
bootstrap();
