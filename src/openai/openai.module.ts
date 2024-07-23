// src/openai/openai.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OpenAIController } from './openai.controller';
import { OpenAIService } from './openai.service';
import { RoomService } from 'src/room/room.service';
import { MonitorService } from 'src/monitor/monitor.service';

@Module({
  imports: [ConfigModule],
  controllers: [OpenAIController],
  providers: [OpenAIService, RoomService, MonitorService],
  exports: [OpenAIService],
})
export class OpenAIModule {}
