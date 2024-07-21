import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class QuizService {
  private springServerUrl: string;
  constructor(
    private httpService: HttpService,
    private configService: ConfigService
  ) {
    this.springServerUrl = this.configService.get<string>('springServerUrl');
  }

  /*
    getQuizGroup 메서드
    spring 서버로 부터 퀴즈 그룹을 가져오는 메서드 
  */
  async getQuizGroup(quizgroupId: string): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(
        `${this.springServerUrl}/quizgroup/send/${quizgroupId}`
      )
    );
    return response.data;
  }
  /*
    quizResult 메서드
    spring 서버로 부터 퀴즈 결과를 가져오는 메서드 
  */
  async getQuizResult(roomCode: string): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.springServerUrl}/quizResult/${roomCode}`)
    );
    return response.data;
  }

  /*
    postQuizResult 메서드
    spring 서버로 퀴즈 결과를 전송하는 메서드 
  */
  async postQuizResult(
    answer: any,
    roomCode: string,
    quizGroupId: number
  ): Promise<any> {
    answer = this.makeSendData(answer, 1);

    const response = await firstValueFrom(
      this.httpService.post(
        `${this.springServerUrl}/quizResult/${roomCode}`,
        answer
      )
    );
    return response.data;
  }

  /*
    makeSendData 메서드
    spring 서버로 퀴즈 결과를 전송하기 위해 데이터를 가공하는 메서드 
  */
  makeSendData(answers: any, quizGroupId: number) {
    const entries = Object.entries(answers);

    let player = [];
    for (const [key, value] of entries) {
      value['nickName'] = key;
      value['quizGroupId'] = quizGroupId;
      player.push(value);
    }
    return player;
  }

  /*
    getQuizRoom 메서드
    spring 서버에서 퀴즈방 정보를 가져오는 메서드
  */
  async getQuizRoom(roomCode: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.springServerUrl}/quizRoom/${roomCode}`)
      );
      return response.data;
    } catch (err) {
      console.log('에러 발생함', err);
    }
  }

  /*
    postQuizRoom 메서드     
    spring 서버에 퀴즈방 정보를 기록하는 메서드
  */
  async postQuizRoom(roomCode: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.springServerUrl}/quizRoom/${roomCode}`)
      );
      return response.data;
    } catch (err) {
      console.log('에러 발생함', err);
    }
  }
}
