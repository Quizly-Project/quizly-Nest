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

  async writeText(roomCode: string, quizNum: string, studentAnswers: string): Promise<void> {

    // const roomData = '{"teacherId":"teacher123","roomCode":"2","clients":[],"clientCnt":3,"userlocations":{},"answers":{"user1":{"selectOption":["A"],"result":[true]},"user2":{"selectOption":["B"],"result":[false]},"user3":{"selectOption":["A"],"result":[true]}},"open":true,"quizGroup":{"id":"2","name":"일반 상식 퀴즈","quizzes":[{"id":"quiz1","question":"대한민국의 수도는?","correctAnswer":"서울"},{"id":"quiz2","question":"1 + 1 = ?","correctAnswer":"2"},{"id":"quiz3","question":"지구에서 가장 가까운 행성은?","correctAnswer":"금성"}]},"quizlength":3,"currentQuizIndex":0,"modelList":[],"modelMapping":{},"currAnswerList":{},"intervalId":null}';

    console.log('roomCode:', roomCode);  // 디버깅용 출력
    const room: Room = this.roomService.getRoom(roomCode);

    const question: string = room.quizGroup.quizzes[quizNum].question;
    const correctAnswer: string = room.quizGroup.quizzes[quizNum].correctAnswer;

    const generatedText: string = await this.generateText(question, correctAnswer, studentAnswers);
  }


  async generateText(roomCode: string, quizNum: string, studentAnswers: string): Promise<string> {


    console.log('roomCode:', roomCode);  // 디버깅용 출력

    // const room: Room = "2";
    const question: string = roomCode;
    const correctAnswer: string = quizNum;


    console.log('질문:', question);
    console.log('정답:', correctAnswer);

    // OpenAI를 사용하여 텍스트 생성 및 비교
    const prompt: string = `질문: ${question}에 대한 공식적인 정답은 ${correctAnswer} 이다. \n 여기 있는 공식적인 정답이 학생들의 답안인 ${studentAnswers} 와 유사한지 판단해줘. 반드시 넌 참이면 숫자'1' 거짓이면 '0'를 줘야만 해.`;

    // const prompt : string = `"ㄱ"으로 시작하는 과일 이름을 말하시오.`;
    const generatedText: string = await this.generateResponse(prompt);

    studentAnswers = generatedText;
    // 생성된 텍스트 출력
    console.log('OpenAI에서 생성된 텍스트:', studentAnswers);

    // 생성된 텍스트를 기반으로 옳고 틀린 답변 구분 및 반환
    const response: string = studentAnswers;

    return response;
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


}


