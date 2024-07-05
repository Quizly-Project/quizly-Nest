import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Observable, map } from 'rxjs';
import { UserPositionService } from 'src/userPosition/userPosition.service';

@Injectable()
export class QuizService {
  private springServerUrl: string;
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    private userPositionService: UserPositionService
  ) {
    this.springServerUrl = this.configService.get<string>('springServerUrl');
  }

  getQuizGroup(quizgroupId: string): Observable<any> {
    return this.httpService
      .get(`${this.springServerUrl}/quizgroup/send/${quizgroupId}`)
      .pipe(map(response => response.data));
  }

  // 방번호, 선생님, 퀴즈 번호
  checkAnswer(room, teacher, correctAnswer) {
    for (let c of room.clients) {
      if (c === teacher) continue;
      let answer = this.userPositionService.checkArea(room, c);
      room.answers.push([]);
      // TODO: 정답 판정 후 결과를 저장할 필요가 있음(DB말고 메모리에 저장)
    }
  }
}
