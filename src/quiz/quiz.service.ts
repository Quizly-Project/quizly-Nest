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

  checkAnswer(userlocations, correctAnswer) {
    userlocations.some((id, value) => {
      const { nickName, position } = value;
      let result;
      if (position.x < 0) {
        // 0이 O
        result = 0;
      } else if (position.x > 0) {
        // 1이 X
        result = 1;
      }

      if (correctAnswer === result) {
      }
    });
  }
}
