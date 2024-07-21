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
  async generateText(question: string, correctAnswer: string, studentAnswers: string[]): Promise<EvaluationResult[]> {
    // 예시로 '1'을 반환하는 부분 추가
    // const exampleResults = studentAnswers.map((_, index) => (index % 2 === 0 ? '1' : '0')) as EvaluationResult[];
    // console.log('Example Results:', exampleResults);

    // Step 1: You will get an answer for ${question} and remember only ${correctAnswer} for the answer.
    // Step 2: Score each student answer (${studentAnswers.join(', ')}) and determine whether each result is right or wrong with '1' and '0'.
    // Please execute these steps for all student answers.
    

    const prompt = `
평가 작업:
주어진 질문에 대한 학생들의 답변을 평가해주세요.

질문: ${question}
정답: ${correctAnswer}

학생 답변:
${studentAnswers.map((sa, index) => `${index + 1}. ${sa}`).join('\n')}

평가 지침:
1. 각 답변을 개별적으로 평가하세요.
2. 완전히 정확한 답변만 정답으로 처리하세요.
3. 부분 점수는 없습니다.
4. 철자 오류나 사소한 표현 차이는 오답으로 처리하세요.

응답 형식:
각 답변에 대해 다음과 같이 번호를 포함하여 응답해주세요:
1. Correct answer
2. Wrong answer
3. Incorrect answer
...

주의: 모든 답변에 대해 번호와 함께 'Correct', 'Right', 'Wrong', 또는 'Incorrect'로 평가해주세요.
`

    try {
      const generatedText: string = await this.generateResponse(prompt);
      // console.log('Generated Text:', generatedText);

      // 응답에서 '1'과 '0'만 추출
      const resultString = this.extractResults(generatedText, studentAnswers.length);
      console.log(`this.extractResults(generatedText, studentAnswers.length) ==>> ${this.extractResults(generatedText, studentAnswers.length)}`);

      // 학생 답변 수와 일치하는지 확인
      if (resultString.length !== studentAnswers.length) {

        console.log(`resultString.length ====>>> : ${resultString.length}`);
        console.log(`studentAnswers.length ===>> : ${studentAnswers.length}`);


        console.warn('응답 길이가 학생 답변 수와 일치하지 않습니다. 기본값으로 처리합니다.');
        // return studentAnswers.map(() => '0') as EvaluationResult[];
      }
      console.log(`resultString.split('') as EvaluationResult[] ===>>>> : ${resultString.split('') as EvaluationResult[]}`);

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

      if (!response.choices || response.choices.length === 0) {
        throw new Error('No response from OpenAI API');
      }

      return response.choices[0].text.trim();
    } catch (error) {
      console.error('OpenAI API 오류:', error);
      throw new Error('텍스트 생성 중 오류가 발생했습니다.');
    }
  }


  private extractResults(generatedText: string, numberOfStudents: number): string {
    console.log("OpenAI Response:", generatedText);
    
    const results: string[] = new Array(numberOfStudents).fill('0');
    const answerPattern = /(\d+)[\s.:]+\s*(correct|right|wrong|incorrect|true|false)(?:\s*answer)?/gi;
    let match;
  
    while ((match = answerPattern.exec(generatedText)) !== null) {
      const index = parseInt(match[1]) - 1;
      const result = match[2].toLowerCase();
      
      if (index >= 0 && index < numberOfStudents) {
        results[index] = (result === 'correct' || result === 'right' || result === 'true') ? '1' : '0';
      }
    }
  
    console.log(`Extracted results: ${results.join('')}`);
    return results.join('');
  }


  // private extractResults(generatedText: string, numberOfStudents: number): string {
  //   const results: string[] = [];

  //   const correctMatches = generatedText.match(/(correct|right|Correct|Right)/gi) || [];
  //   const wrongMatches = generatedText.match(/(wrong|incorrect|Wrong|Incorrect)/gi) || [];

  //   console.log(`correctMatches == \n${correctMatches}`);
  //   console.log(`wrongMatches == \n${wrongMatches}`);

  //   for (const match of correctMatches) {
  //     results.push('1');
  //     // responses.push(match);
  //   }
  //   for (const match of wrongMatches) {
  //     results.push('0');
  //     // responses.push(match);
  //   }

  //   console.log(`Outter generatedText == \n${generatedText}`);


  //   console.log(`results.join('') == \n${results.join('')}`);
  //   return results.join('');

  // }



}
