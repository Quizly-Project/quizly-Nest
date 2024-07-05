import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { Observable, map } from "rxjs";

@Injectable()
export class QuizService {
  private springServerUrl: string;
  constructor(
    private httpService: HttpService,
    private configService: ConfigService
  ) {
    this.springServerUrl = this.configService.get<string>("springServerUrl");
  }

  getQuizGroup(quizgroupId: string): Observable<any> {
    return this.httpService
      .get(`${this.springServerUrl}/quizgroup/send/${quizgroupId}`)
      .pipe(map((response) => response.data));
  }
}
