// openai.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import Room from 'src/interfaces/room.interface'; // Room 인터페이스 임포트
import { RoomService } from 'src/room/room.service';

@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    private roomService: RoomService
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
    
  }
// roomCode

  // async generateText(roomCode: string, quizNum:number){
  //   const room = this.roomService.getRoom(roomCode);
    
  //   const question = room.quizGroup.quizzes[quizNum]['question'];
  //   const correctAnswer = room.quizGroup.quizzes[quizNum]['currectAnswer'];

  //   console.log(question, correctAnswer);

  //   const stuAnswers = JSON.stringify(room.currAnswerList);
  // }

  // =========================================================================

  // async writeText(roomCode: string, quizNum: string, studentAnswers: string[]): Promise<void> {

  //   // const roomData = '{"teacherId":"teacher123","roomCode":"2","clients":[],"clientCnt":3,"userlocations":{},"answers":{"user1":{"selectOption":["A"],"result":[true]},"user2":{"selectOption":["B"],"result":[false]},"user3":{"selectOption":["A"],"result":[true]}},"open":true,"quizGroup":{"id":"2","name":"일반 상식 퀴즈","quizzes":[{"id":"quiz1","question":"대한민국의 수도는?","correctAnswer":"서울"},{"id":"quiz2","question":"1 + 1 = ?","correctAnswer":"2"},{"id":"quiz3","question":"지구에서 가장 가까운 행성은?","correctAnswer":"금성"}]},"quizlength":3,"currentQuizIndex":0,"modelList":[],"modelMapping":{},"currAnswerList":{},"intervalId":null}';

  //   console.log('roomCode:', roomCode);  // 디버깅용 출력
  //   const room: Room = this.roomService.getRoom(roomCode);

  //   const question: string = room.quizGroup.quizzes[quizNum].question;
  //   const correctAnswer: string = room.quizGroup.quizzes[quizNum].correctAnswer;

  //   const generatedText: string = await this.generateText(question, correctAnswer, studentAnswers);
  // }


  async generateText(roomCode: string, quizNum: string, studentAnswers: string[]): Promise<string> {


    console.log('roomCode:', roomCode);  // 디버깅용 출력

    // const room: Room = "2";
    const question: string = roomCode;
    const correctAnswer: string = quizNum;



    let allResponses: string[] = [];

    for (const studentAnswer of studentAnswers) 
    {
      // 각각의 답안에 대한 답변을 줘야하며 
      // 예외적인 상황이 발생하면 '-'을 줘. 
      // 그리고 답변하는데 3초 이상 시간이 소모되면 '-'를 줘.
      // 만약에 1이 두 개이고 0이 하나라면 1 1 0 이라는 결과가 나와야만 해.
      
      // const prompt: string = `질문: ${question}에 대한 공식적인 정답은 ${correctAnswer} 이다. \n 여기 있는 ${correctAnswer}과 학생들의 배열 형식의 답안인 ${studentAnswer} 를 채첨해줘. 반드시! 절대로 넌 참이면 숫자'1' 거짓이면 '0'를 주고 '0'이나 '1'만 말할 수 있어. `;
      // const prompt: string = `
      // 질문: ${question}에 대한 공식 정답은 ${correctAnswer} 이다. 
      // \n 여기 있는 ${correctAnswer}과 각각 학생 답안인 ${studentAnswer} 를 채첨해줘. 
      // 반드시! 절대로 넌 채점 결과를 참이면 숫자'1' 거짓이면 '0'를 주고 '0'이나 '1'만 말할 수 있어. `;

      // const prompt: string = `For answers to ${question} refer to ${correctAnswer} and score ${studentAnswer} as '1'. And don't write the previous data you learned. Focus only on the present.`;

      const prompt: string =  `
Step 1: You will get an answer for ${question} and remember only ${correctAnswer} for the answer.
Step 2: Scores ${correctAnswer} and ${studentAnswer} and determine whether the result is right or wrong with '1' and '0'.
Step 3: Show the results of ${studentAnswer}.
Please execute these step by step.
`

      console.log('prompt : ', prompt);

      // const prompt: string = `
      // ${correctAnswer}은 ${studentAnswer} 와 동일하다. 이에 대한 결과를 참이면 숫자'1' 거짓이면 '0'를 주고 '0'이나 '1'만 말할 수 있어. `;



// console.log('studentAnswer:', studentAnswer);
// console.log('studentAnswer length:', studentAnswer.length);
// console.log('studentAnswers:', studentAnswers);
// console.log('studentAnswers length:', studentAnswers.length);


console.log('질문:', question);
console.log('정답:', correctAnswer);

      // const prompt: string = `${studentAnswer}가 뭐야?`;
      var generatedText: string = await this.generateResponse(prompt);
      console.log('generatedText:', generatedText);

      // console.log('ㅁㄴㅇ11 정답:', studentAnswers);
      // console.log('ㅁㄴㅇ22 정답:', studentAnswer);
      // Post-process to ensure only '0', '1', or '-' are included


      const validatedResponse = this.validateResponse(generatedText);
      console.log('validatedResponse:', validatedResponse);
      allResponses.push(validatedResponse);
      console.log('allResponses:', allResponses);

    }



    return allResponses.join(' ');

    // return allResponses.join('\n');
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

  // private validateResponse(response: string): string[] {
  //   // Allow only '0', '1', or '-'
  //   const validResponses = ['0', '1'];
  //   return response.split('').filter(char => validResponses.includes(char));

  // }

  private validateResponse(response: string): string {
    // Allow only '0' and '1'
    const validResponses = ['0', '1'];
    return response.split('').map(char => validResponses.includes(char) ? char : '').join('');
}


}


