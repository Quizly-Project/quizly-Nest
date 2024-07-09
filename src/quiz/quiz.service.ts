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

  // getQuizGroup(quizgroupId: string): Observable<any> {
  //   return this.httpService
  //     .get(`${this.springServerUrl}/quizgroup/send/${quizgroupId}`)
  //     .pipe(map(response => response.data));
  // }

  async getQuizGroup(quizgroupId: string): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(
        `${this.springServerUrl}/quizgroup/send/${quizgroupId}`
      )
    );
    return response.data;
  }
}
