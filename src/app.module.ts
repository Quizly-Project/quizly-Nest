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
import { MonitorService } from './monitor/monitor.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      load: [configuration],
    }),
    ChatModule,
    LiveKitModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    QuizGameGateway,
    RoomService,
    UserPositionService,
    QuizService,
    PlayService,
    MonitorService,
  ],
})
export class AppModule {}
