import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  constructor(private httpService: HttpService) {}

  getHello(): string {
    return 'Hello World!';
  }

  //TODO: Promise<any>를 반환하는 Spring 서버에 요청을 보내는 메서드를 구현할 것

  async getQuizGroup(): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get('http://localhost:8080/quizgroup/send/1')
    );
    return response.data;
  }
}
