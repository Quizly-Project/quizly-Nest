import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Observable, firstValueFrom, map } from 'rxjs';
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

  async postQuizResult(quizNum: string, answer: any): Promise<any> {
    console.log('postQuizResult ::', answer);
    const response = await firstValueFrom(
      this.httpService.post(`http://localhost:8080/quizResult/quiz/1`, answer)
    );
    return response.data;
    // return this.httpService
    //   .post(`http://localhost:8080/quizResult/quiz/1`, answer)
    //   .pipe(map(response => response.data));
  }
}
