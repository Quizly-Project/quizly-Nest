import { Injectable } from '@nestjs/common';
import { QuizService } from 'src/quiz/quiz.service';
import { RoomService } from 'src/room/room.service';

@Injectable()
export class PlayService {
  constructor(
    private roomService: RoomService,
    private quizService: QuizService
  ) {
    this.quizService = quizService;
    this.roomService = roomService;
  }

  /*
    quizResultSaveLocal 메서드
    1. 학생들의 위치 값을 가지고 O, X 판정 수행 
    2. 학생들의 답안과 퀴즈의 정답을 비교하여 결과 도출
    3. 해당 결과를 저장한다. 
  */
  quizResultSaveLocal(room, quizNum){
    room.userlocations.forEach((value, key) => {
      if(value.nickName === "teacher") return;
      var { nickName, position } = value;
      // answer - "0" : O, "1" : X
      var answer = this.checkArea(position.x);

      // 해당 닉네임에 대한 퀴즈 결과 객체가 없으면 생성 
      room.answers[nickName] =  room.answers[nickName] || {selectOption: [], result: []};
      room.answers[nickName].selectOption.push(answer);

      // 정답 / 오답 결과를 저장 
      var result = this.checkAnswer(answer, room.quizGroup.quizs[quizNum].correctAnswer);
      room.answers[nickName].result.push(result);
    
      // TODO: 현재 퀴즈에 대한 정보를 nickName : "O"
    });    
  }

  checkAnswer(stuAnswer, correctAnswer) :string{
    if(stuAnswer === correctAnswer) {
        // 0은 정답
        return "0";
      } else {
        // 1은 오답
        return "1";
      }
  }

  /*
    checkArea 메서드
    O, X 판정을 위한 메서드 
  */
  checkArea(point): string {
    // TODO: 선생님 위치와 학생 위치를 비교하여 학생이 선생님 영역에 들어왔는지 확인
    //const room = this.rooms[teacher['roomCode']];

    if (point < 0) {
      // 0은 O 발판
      return "0";
    } else if (point > 0) {
      // 1은 X 발판
      return "1";
    }
    // TODO: 우선 O, X 판정만 구분
  }
}
