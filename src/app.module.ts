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

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    QuizGameGateway,
    RoomService,
    UserPositionService,
    QuizService,
  ],
})
export class AppModule {}
