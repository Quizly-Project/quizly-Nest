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

  // constructor(private configService: ConfigService) {
  //   this.openai = new OpenAI({
  //     apiKey: this.configService.get<string>('OPENAI_API_KEY'),
  //   });
  // }
  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  // 1. 각 ${studentAnswer}답변을 개별적으로 평가하세요.
  async generateText(question: string, 
    correctAnswer: string, 
    studentAnswers: string[]): Promise<EvaluationResult[]> {
    const results: EvaluationResult[] = [];
    
    console.log("ccccccccc : ", studentAnswers);

    for (const studentAnswer of studentAnswers) {
      const prompt = `
                    평가 작업:
                    주어진 질문에 대한 학생들의 답변을 평가해주세요.
                        
                    질문: ${question}
                    정답: ${correctAnswer}
                        
                    학생 답변:
                    ${studentAnswer}
                        
                        
                        
                    평가 지침:
                    1. 응답은 서술이 아닌 아주 간단한 단답으로 하세요.
                    2. ${correctAnswer} 를 기준으로 하는 답변만 정답으로 처리하세요.
                    3. 부분 점수는 없습니다.
                    4. 철자 오류나 사소한 표현 차이는 오답으로 처리하세요.
                    5. ${studentAnswer}답변에 대한 평가는 오직 하나입니다.
                    6. 중복 응답은 없습니다.
                        
                    응답 형식:
                    각 ${studentAnswer}답변에 대해 다음과 같이 번호를 포함하여 응답해주세요:
                    1. Correct answer

                    주의: 모든 답변에 대해 번호와 함께 'Correct' 또는 'Wrong'로 둘 중에 하나만 평가하세요.
                    `

      try {


        const generatedText: string = await this.generateResponse(prompt);
        console.log(`Generated Text: ${generatedText}`);

        const evaluation = this.extractResults(generatedText);
        console.log(`evaluation ==>> : ${evaluation}`);


        results.push(evaluation as EvaluationResult);
      } catch (error) {
        console.log('Error during text generation:', error);
        results.push('0');
      }

    }
    // Ensure results are returned
  return results;
  }

  private async generateResponse(prompt: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{role:'user',content:prompt}],
        max_tokens: 150,
      });

      if (!response.choices || response.choices.length === 0) {
        throw new Error('No response from OpenAI API');
      }

      // return response.choices[0].text.trim();
      return response.choices[0].message?.content?.trim() || '';
    } catch (error) {
      console.error('OpenAI API 오류:', error);
      throw new Error('텍스트 생성 중 오류가 발생했습니다.');
    }
  }
  
  // private extractResults(generatedText: string): EvaluationResult {
  //   const normalizedText = generatedText.trim().toLowerCase();
  //   const keywords = ['correct', 'right', 'true'];
  //   for (const keyword of keywords) {
  //     if (normalizedText.includes(keyword)) {
  //       return '1';
  //     }
  //   }
  //   return '0';
  // }



  private extractResults(generatedText: string): string {
    // console.log("OpenAI Response:", generatedText);


    const answerPattern = /(\d+)[\s.:]+\s*(correct|right|wrong|incorrect|true|false)(?:\s*answer)?/gi;
    // console.log("answerPattern:", answerPattern);

    let match;
    const results: string[] = [];


    while ((match = answerPattern.exec(generatedText)) !== null) {
      const index = parseInt(match[1]) - 1;
      const result = match[2].toLowerCase();


      results[index] = (result === 'correct' || result === 'right' || result === 'true') ? '1' : '0';

    }

    console.log(`Extracted results: ${results.join('')}`);
    return results.join('');
  }


}
