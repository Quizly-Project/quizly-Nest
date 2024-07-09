import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { join } from 'path';
import { HttpService } from '@nestjs/axios';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly htppService: HttpService
  ) {}

  @Get()
  getHtml(@Res() res: Response) {
    res.sendFile(join(__dirname, '..', 'static', 'index.html'));
  }

  // AppService에 있는 Promise를 반환하는 Spring 서버에 요청을 보내는 메서드로 부터 Promise 값을 받아서 상황에 따라서 resolve 또는 reject를 실행한다. 그리고 해당 데이터를 꺼내라
  @Get('/quizGroup')
  async getQuizGroup(): Promise<any> {
    try {
      let result = await this.appService.getQuizGroup();
      return result;
    } catch (error) {
      throw new Error('뀨');
    }
  }
}
