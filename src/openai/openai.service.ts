// src/openai/openai.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set in the environment variables');
    }
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  async generateText(prompt: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
      });
      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('OpenAI API 오류:', error);
      throw new Error('텍스트 생성 중 오류가 발생했습니다.');
    }
  }
}