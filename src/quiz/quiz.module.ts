import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { QuizService } from "./quiz.service";

@Module({
  imports: [HttpModule],
  providers: [QuizService],
  exports: [QuizService],
})
export class QuizModule {}
