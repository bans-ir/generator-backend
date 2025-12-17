import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as path from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

app.enableCors({
  origin: 'https://power.adadsoft.ir/', // your frontend
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'User-Agent', 'sec-ch-ua', 'sec-ch-ua-platform', 'sec-ch-ua-mobile'],
  credentials: true, // only if you use cookies or auth
});


  app.useStaticAssets(path.join(__dirname, '..', 'public'), {
    prefix: '/public/',
  });

  await app.listen(process.env.PORT ??5000);
}
bootstrap();
