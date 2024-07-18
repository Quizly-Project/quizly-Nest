// src/openai/openai.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { OpenAIService } from './openai.service';

@Controller('openai')
export class OpenAIController {
  constructor(private readonly openaiService: OpenAIService) {}

  // @Post('generate')
  // async generateText(@Body('prompt') prompt: string) {
  //   const generatedText = await this.openaiService.generateText(prompt);
  //   return { result: generatedText };
  // }
}
