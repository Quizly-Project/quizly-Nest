import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { join } from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHtml(@Res() res: Response) {
    res.sendFile(join(__dirname, '..', 'static', 'index.html'));
  }
}
