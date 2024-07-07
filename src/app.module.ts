import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PositionGateway } from "./position/position.gateway";
import { QuizModule } from "./quiz/quiz.module";
import { ConfigModule } from "@nestjs/config";
import { ChatModule } from './chat/chat.module';
import configuration from "./config/configuration";
import { LiveKitModule } from './livekit/livekit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    QuizModule,
    ChatModule,
    LiveKitModule,
  ],
  controllers: [AppController],
  providers: [AppService, PositionGateway],
})
export class AppModule {}
