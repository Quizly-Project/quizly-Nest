import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PositionGateway } from './position/position.gateway';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, PositionGateway],
})
export class AppModule {}
