import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import Room from 'src/interfaces/room.interface';
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
  private timers: Map<string, NodeJS.Timeout> = new Map();
  /*
    quizResultSaveLocal 메서드
    1. 학생들의 위치 값을 가지고 O, X 판정 수행 
    2. 학생들의 답안과 퀴즈의 정답을 비교하여 결과 도출
    3. 해당 결과를 저장한다. 
  */
  quizResultSaveLocal(room, quizNum): any {
    let data;
    let correctAnswer;
    let dataList = {};
    let correctAnswerList = [];
    let quizScore = room.quizGroup.quizzes[quizNum].score;

    let currRank = [];

    room.userlocations.forEach((value, key) => {
      console.log('key : ', key);
      const { nickName, position } = value;
      if (value.nickName === 'teacher') return;

      // answer - "0" : O, "1" : X
      let answer;
      let result;

      // type - 퀴즈 유형
      let type = room.quizGroup.quizzes[quizNum].type;
      if (type === 1) {
        answer = this.checkAreaOX(position.x);
      } else if (type === 2) {
        answer = this.checkArea4(position.x, position.z);
      } else {
        console.log('윙... 현재 이런 타입은 없어요....');
      }

      // 해당 닉네임에 대한 퀴즈 결과 객체가 없으면 객체가 생성됨
      room.answers[nickName] = room.answers[nickName] || {
        selectOption: [],
        result: [],
        totalScore: 0,
      };

      room.answers[nickName].selectOption.push(answer);

      // 정답 / 오답 결과를 저장
      correctAnswer = room.quizGroup.quizzes[quizNum].correctAnswer;
      if (answer === undefined) {
        // 오답인 경우 오답을 의미하는 '0'을 저장
        room.answers[nickName].result.push('0');
      } else {
        result = this.checkAnswer(answer, correctAnswer);
        if (result === '1') {
          room.answers[nickName].totalScore += quizScore;
          correctAnswerList.push(nickName);
        }
        room.answers[nickName].result.push(result);
      }
      currRank.push({
        nickName: nickName,
        totalScore: room.answers[nickName].totalScore,
      });
      // answer - 선택한 답, result - 정답 여부, score - 현재 퀴즈 점수, totalScore - 현재 본인 총 점수
      data = {
        nickName: nickName,
        userAnswer: answer,
        result: result,
        quizScore: quizScore,
        totalScore: room.answers[nickName].totalScore,
        currRank: currRank,
      };

      dataList[key] = data;
    });

    currRank.sort((a, b) => b.age - a.age);

    return { dataList, correctAnswerList, quizScore, correctAnswer, currRank };
  }

  checkAnswer(stuAnswer, correctAnswer): string {
    if (stuAnswer === correctAnswer) {
      // 1은 정답
      return '1';
    } else {
      // 0은 오답
      return '0';
    }
  }

  /*
    checkArea 메서드
    O, X 판정을 위한 메서드 
  */
  checkAreaOX(point): string {
    // TODO: pointX가 0인 경우 예외 처리 필요.

    if (point < 0) {
      // 1은 O 발판
      return '1';
    } else if (point > 0) {
      // 2는 X 발판
      return '2';
    } else {
      // 고르지 않은 경우
      return '0';
    }
  }

  checkArea4(pointX, pointZ) {
    // TODO: pointX나 pointZ가 0인 경우 예외 처리 필요.
    if (pointX < 0 && pointZ > 0) {
      return '1';
    } else if (pointX > 0 && pointZ > 0) {
      return '2';
    } else if (pointX < 0 && pointZ < 0) {
      return '3';
    } else if (pointX > 0 && pointZ < 0) {
      return '4';
    } else {
      // 아무것도 선택하지 않은 경우
      return '0';
    }
  }

  // 대기실방에서 퀴즈 시작
  startQuiz(client: Socket, server: Server) {
    const room = this.roomService.getRoom(client['roomCode']);

    if (!room) {
      return;
    }
    this.startNextQuiz(room, server);
  }

  // 다음 퀴즈를 시작
  startNextQuiz(room: Room, server: Server) {
    const quizGroup = room.quizGroup;

    if (!quizGroup) {
      return;
    }

    const quizzes = quizGroup.quizzes;

    if (++room.currentQuizIndex >= quizzes.length) {
      // 퀴즈가 끝나면
      room.open = false;
      room.clients.forEach(client => {
        // TODO: 나중에 추가로 전송할 데이터 정의
        client.emit('quizEnd', room.answers);
      });
      return;
    }

    const quiz = quizzes[room.currentQuizIndex];
    room.clients.forEach(client => {
      client.emit('quiz', {
        quiz: quiz,
        currentQuizIndex: room.currentQuizIndex,
      });
    });
    this.startQuizTimer(room, server, quizzes[room.currentQuizIndex].time);
  }

  // 해당 퀴즈 타이머 시작
  startQuizTimer(room: Room, server: Server, duration: number) {
    console.log(duration, room.roomCode);

    this.stopQuizTimer(room.roomCode);
    const timer = setTimeout(() => {
      // 타임아웃 처리
      this.handleTimeout(room, server);
    }, duration * 1000);

    this.timers.set(room.roomCode, timer);

    room.clients.forEach(client => {
      client.emit('timerStart', duration);
    });
  }

  // 해당 퀴즈 타이머 종료
  stopQuizTimer(roomCode: string) {
    const timer = this.timers.get(roomCode);

    if (timer) {
      // 타이머가 존재하면 제거
      clearTimeout(timer);
      this.timers.delete(roomCode);
    }
  }

  // 타임아웃 처리
  handleTimeout(room: Room, server: Server) {
    console.log('타임아웃');
    // 타이머가 종료되면 타임아웃 이벤트를 방에 속한 모든 클라이언트에게 전송
    let { dataList, correctAnswerList, quizScore, correctAnswer, currRank } =
      this.quizResultSaveLocal(room, room.currentQuizIndex);
    room.clients.some(client => {
      if (room.teacherId === client.id) {
        client.emit('timeout', {
          answers: room.answers,
          correctAnswer,
          correctAnswerList,
          currRank,
        });
      } else {
        dataList[client.id].correctAnswerList = correctAnswerList;
        dataList[client.id].correctAnswer = correctAnswer;
        client.emit('timeout', dataList[client.id]);
      }
    });
    // 타이머를 맵에서 제거
    this.timers.delete(room.roomCode);
  }
}
