// src/openai/openai.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OpenAIController } from './openai.controller';
import { OpenAIService } from './openai.service';
import { RoomService } from 'src/room/room.service';
import { QuantizationService } from 'src/quantization/quantization.service';

@Module({
  imports: [ConfigModule],
  controllers: [OpenAIController],
  providers: [OpenAIService, RoomService, QuantizationService],
  exports: [OpenAIService],
})
export class OpenAIModule {}
