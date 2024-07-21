import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

interface StudentAnswer {
  nickName: string;
  id: string;
  answer: string;
}

// interface EvaluationResult {
//   nickName: string;
//   result: '0' | '1';
// }

export type EvaluationResult = '1' | '0';

@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  //Step 3: Show the results of each student answer.
  async generateText(
    question: string,
    correctAnswer: string,
    studentAnswers: any[]
  ): Promise<EvaluationResult[]> {
    const prompt = `
    Step 1: You will get an answer for ${question} and remember only ${correctAnswer} for the answer.
    Step 2: Score each student answer (${studentAnswers.join(', ')}) and determine whether each result is right or wrong with '1' and '0'.
    Please execute these steps for all student answers.
    `;

    try {
      const generatedText: string = await this.generateResponse(prompt);
      console.log('Generated Text:', generatedText);

      // 응답에서 '1'과 '0'만 추출
      const resultString = this.extractResults(generatedText);

      // 학생 답변 수와 일치하는지 확인
      if (resultString.length !== studentAnswers.length) {
        console.warn(
          '응답 길이가 학생 답변 수와 일치하지 않습니다. 기본값으로 처리합니다.'
        );
        return studentAnswers.map(() => '0') as EvaluationResult[];
      }

      return resultString.split('') as EvaluationResult[];
    } catch (error) {
      console.error('Error in generateText:', error);
      // 오류 발생 시 모든 답변을 오답으로 처리
      return studentAnswers.map(() => '0') as EvaluationResult[];
    }
  }

  private async generateResponse(prompt: string): Promise<string> {
    try {
      const response = await this.openai.completions.create({
        model: 'gpt-3.5-turbo-instruct',
        prompt: prompt,
        max_tokens: 150,
      });
      return response.choices[0].text.trim();
    } catch (error) {
      console.error('OpenAI API 오류:', error);
      throw new Error('텍스트 생성 중 오류가 발생했습니다.');
    }
  }

  private extractResults(generatedText: string): string {
    const correctMatches =
      generatedText.match(/Result: (correct|right)/gi) || [];
    const wrongMatches =
      generatedText.match(/Result: (wrong|incorrect)/gi) || [];

    const responses: string[] = [];
    for (const match of correctMatches) {
      responses.push('1');
    }
    for (const match of wrongMatches) {
      responses.push('0');
    }

    return responses.join('');
  }
}
