import { Injectable } from '@nestjs/common';
import { QuizService } from 'src/quiz/quiz.service';
import { RoomService } from 'src/room/room.service';

@Injectable()
export class PlayService {
  constructor(
    private roomService: RoomService,
    private quizService: QuizService
  ) {
    this.quizService = quizService;
    this.roomService = roomService;
  }
}
