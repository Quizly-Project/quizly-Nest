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

      const prompt: string =  `
      Step 1: You will get an answer for ${question} and remember only ${correctAnswer} for the answer.
      Step 2: Scores ${correctAnswer} and ${studentAnswer} and determine whether the result is right or wrong with '1' and '0'.
      Step 3: Show the results of ${studentAnswer}.
      Please execute these step by step.`


      console.log('질문:', question);
      console.log('정답:', correctAnswer);


      var generatedText: string = await this.generateResponse(prompt);
      console.log('generatedText=====>>>> :', generatedText);


      const validatedResponse = this.validateResponse(generatedText);
      console.log('validatedResponse:', validatedResponse);
      allResponses.push(validatedResponse);
      console.log('allResponses:', allResponses);

    }



    return allResponses.join(' ');

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



  private validateResponse(response: string): string {
    // "wrong", "Wrong", "incorrect", "Incorrect"이 응답에 포함되어 있으면 0을 반환하고,
    // "correct" 또는 "Correct"가 응답에 포함되어 있으면 1을 반환
    const correctResponses = ['correct', 'Correct'];
    const wrongResponses = ['wrong', 'Wrong', 'incorrect', 'Incorrect'];
  
    if (wrongResponses.some(wrong => response.includes(wrong))) {
      return '0';
    } else if (correctResponses.some(correct => response.includes(correct))) {
      return '1';
    } else {
      // 예기치 않은 응답 처리
      return '0';
    }
  }
  


}