import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PositionGateway } from "./position/position.gateway";
import { QuizModule } from "./quiz/quiz.module";
import { ConfigModule } from "@nestjs/config";
import configuration from "./config/configuration";
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    QuizModule,
  ],
  controllers: [AppController],
  providers: [AppService, PositionGateway],
})
export class AppModule {}
