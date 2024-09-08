import { ChatModule } from './chat/chat.module';
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QuizGameGateway } from './quiz-game/quiz-game.gateway';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { RoomService } from './room/room.service';
import { UserPositionService } from './userPosition/userPosition.service';
import { QuizService } from './quiz/quiz.service';
import { PlayService } from './play/play.service';
import { LiveKitModule } from './livekit/livekit.module';

//
import { OpenAIModule } from './openai/openai.module';
import Room from './interfaces/room.interface'; // Room 인터페이스 임포트
import { OpenAIService } from './openai/openai.service';
import { QuantizationService } from './quantization/quantization.service';
import { MonitorService } from './monitor/monitor.service';
//
@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    ChatModule,
    LiveKitModule,
    OpenAIModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    QuizGameGateway,
    RoomService,
    UserPositionService,
    QuizService,
    PlayService,
    QuantizationService,
    MonitorService,

    // 기타 필요한 프로바이더들
    // {
    //   provide: 'Room', // Room을 프로바이더로 등록
    //   useClass: Room,
    // },
  ],
})
export class AppModule {}
