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
    let correctAnswer;
    room.userlocations.forEach((value, key) => {
      if (value.nickName === 'teacher') return;
      const { nickName, position } = value;
      // answer - "0" : O, "1" : X

      let answer;
      let type = room.quizGroup.quizzes[quizNum].type;
      console.log(room.quizGroup.quizzes);
      if (type === 1) {
        answer = this.checkAreaOX(position.x);
      } else if (type === 2) {
        answer = this.checkArea4(position.x, position.z);
      } else {
        console.log('윙... 현재 이런 타입은 없어요....');
      }

      // 해당 닉네임에 대한 퀴즈 결과 객체가 없으면 생성
      room.answers[nickName] = room.answers[nickName] || {
        selectOption: [],
        result: [],
      };

      room.answers[nickName].selectOption.push(answer);

      // 정답 / 오답 결과를 저장
      correctAnswer = room.quizGroup.quizzes[quizNum].correctAnswer;
      if (answer === undefined) {
        // 오답인 경우 오답을 의미하는 '1'을 저장
        room.answers[nickName].result.push('1');
      } else {
        let result = this.checkAnswer(answer, correctAnswer);
        room.answers[nickName].result.push(result);
      }

      console.log(room.answers);
    });
    return correctAnswer;
  }

  checkAnswer(stuAnswer, correctAnswer): string {
    if (stuAnswer === correctAnswer) {
      // 0은 정답
      return '0';
    } else {
      // 1은 오답
      return '1';
    }
  }

  /*
    checkArea 메서드
    O, X 판정을 위한 메서드 
  */
  checkAreaOX(point): string {
    // TODO: pointX가 0인 경우 예외 처리 필요.

    if (point < 0) {
      // 0은 O 발판
      return '0';
    } else if (point > 0) {
      // 1은 X 발판
      return '1';
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
        client.emit('quizEnd');
      });
      return;
    }

    const quiz = quizzes[room.currentQuizIndex];
    room.clients.forEach(client => {
      client.emit('quiz', quiz);
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
    let correctAnswer = this.quizResultSaveLocal(room, room.currentQuizIndex);
    room.clients.some(client => {
      client.emit('quiz', correctAnswer);
    });
    // 타이머를 맵에서 제거
    this.timers.delete(room.roomCode);
  }
}
// 임시로 사용할 퀴즈 그룹 객체
const quizGroup = {
  quizGroup: 1,
  quizTitle: '제목',
  quizDescription: '설명',
  user: {
    id: 1,
    username: 'admin4',
    password: '$2a$10$OMLUjlNcydW2ECtYmWczeuUZVMqKwqq/ZJLmQ6OD7hKUMhODMcst6',
    email: 'admin4@naver.com',
    role: 'ROLE_ADMIN',
  },
  quizzs: [
    {
      quizId: 1,
      type: 1,
      question: '질문1',
      correctAnswer: '0',
      quizScore: 30,
      time: 15,
      options: [],
    },
    {
      quizId: 2,
      type: 2,
      question: '질문2',
      correctAnswer: '0',
      quizScore: 30,
      time: 15,
      options: [
        {
          optionId: 1,
          optionText: '선택지1',
          optionNum: 1,
        },
        {
          optionId: 2,
          optionText: '선택지2',
          optionNum: 2,
        },
        {
          optionId: 3,
          optionText: '선택지3',
          optionNum: 3,
        },
        {
          optionId: 4,
          optionText: '선택지4',
          optionNum: 4,
        },
      ],
    },
    {
      quizId: 3,
      type: 2,
      question: '질문2',
      correctAnswer: '0',
      quizScore: 30,
      time: 15,
      options: [
        {
          optionId: 5,
          optionText: '선택지1',
          optionNum: 1,
        },
        {
          optionId: 6,
          optionText: '선택지2',
          optionNum: 2,
        },
        {
          optionId: 7,
          optionText: '선택지3',
          optionNum: 3,
        },
        {
          optionId: 8,
          optionText: '선택지4',
          optionNum: 4,
        },
      ],
    },
  ],
};
