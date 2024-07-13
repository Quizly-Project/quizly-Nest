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
  async getQuizGroup(quizgroupId: string): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(
        `${this.springServerUrl}/quizgroup/send/${quizgroupId}`
      )
    );
    return response.data;
  }

  async getQuizResult(roomCode: string): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.springServerUrl}/quizResult/${roomCode}`)
    );
    return response.data;
  }

  async postQuizResult(
    answer: any,
    roomCode: string,
    quizGroupId: number
  ): Promise<any> {
    answer = this.makeSendData(answer, 1);

    console.log(answer);

    const response = await firstValueFrom(
      this.httpService.post(
        `${this.springServerUrl}/quizResult/${roomCode}`,
        answer
      )
    );
    return response.data;
  }

  makeSendData(answers: any, quizGroupId: number) {
    console.log('aaaa', answers);
    const entries = Object.entries(answers);

    let player = [];
    for (const [key, value] of entries) {
      console.log(key, value);
      value['nickName'] = key;
      value['quizGroupId'] = quizGroupId;
      player.push(value);
    }

    console.log(player);
    return player;
  }

  async getQuizRoom(roomCode: string): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.springServerUrl}/quizRoom/${roomCode}`)
    );
    return response.data;
  }

  async postQuizRoom(roomCode: string): Promise<any> {
    console.log('roomCode : ', roomCode);
    const response = await firstValueFrom(
      this.httpService.post(`${this.springServerUrl}/quizRoom/${roomCode}`)
    );
    return response.data;
  }
}
