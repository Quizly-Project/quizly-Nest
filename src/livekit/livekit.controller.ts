import { Controller, Post, Body, HttpCode, HttpException, HttpStatus, Req, Headers } from '@nestjs/common';
import { LiveKitService } from './livekit.service';
import { Request } from 'express';  // 이 줄을 추가합니다.

@Controller('webrtc')
export class LiveKitController {
  constructor(private readonly liveKitService: LiveKitService) {}

  @Post('token')
  @HttpCode(200)
  async getToken(@Body() body: { roomName: string; participantName: string }) {
    try {
      return await this.liveKitService.generateToken(body.roomName, body.participantName);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('webhook') // 채팅방이 끝났는지, 참가자가 떠났는지 등을 알려준다
  async handleWebhook(@Req() req: Request, @Headers('authorization') authorization: string) {
    return this.liveKitService.handleWebhook(req.body, authorization);
  }
}