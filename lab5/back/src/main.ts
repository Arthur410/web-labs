import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  await app.listen(5000, '127.0.0.1');
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
