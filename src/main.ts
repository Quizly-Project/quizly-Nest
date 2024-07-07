import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(3000);

  const webrtcApp = await NestFactory.create(AppModule);
  webrtcApp.enableCors();
  await webrtcApp.listen(process.env.WEBRTC_PORT || 6080);
}
bootstrap();
