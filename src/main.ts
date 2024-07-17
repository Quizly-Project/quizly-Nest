import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClusterService } from './cluster/cluster.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(3003, '0.0.0.0');

  // const app = await NestFactory.create(AppModule);
  // app.enableCors();
  // await app.listen(process.env.SERVER_PORT || 3000);
}
ClusterService.clusterize(bootstrap);
