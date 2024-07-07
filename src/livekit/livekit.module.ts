import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LiveKitController } from './livekit.controller';
import { LiveKitService } from './livekit.service';

@Module({
  imports: [ConfigModule],
  controllers: [LiveKitController],
  providers: [LiveKitService],
})
export class LiveKitModule {}