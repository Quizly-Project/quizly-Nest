import { Injectable } from '@nestjs/common';
//
import { HttpService } from '@nestjs/axios';
//
import { Socket } from 'socket.io';
import Room from 'src/interfaces/room.interface';

import { lastValueFrom } from 'rxjs';  // 수정된 부분
import path from 'node:path/win32';





@Injectable()
export class RoomService {
  private rooms: Map<string, Room> = new Map();

  // 닉네임 당 문제 덩어리
  "nickname" : 
  {
    "selectOption" : "이것은 학생이 선택한 문제가 OX 이냐를 선택한 것",
    "result" : "그 선택한 문제가 O인지 x인지",
    "totalScore" : "총 점수 모든 문제에 대한 총 점수"
  }
  constructor(private readonly httpService: HttpService) {}
  //

  createRoom(client: Socket, quizGroup: any): Room {
    const teacherId = client.id;
    const roomCode = teacherId.substr(0, 8);

    console.log(client.id);
    if (this.rooms.has(roomCode)) {
      console.log('이미 생성된 방입니다.');
      return;
    }

    client['roomCode'] = roomCode;
    const room: Room = {
      teacherId: teacherId,
      roomCode,
      clients: [],
      clientCnt: 0,
      userlocations: new Map(),
      answers: {},
      open: true,
      quizGroup,
      currentQuizIndex: -1,
    };

    // room.userlocations.set(client.id, {
    //   nickName: 'teacher',
    //   position: { x: 0, y: 0, z: 0 },
    // });

    this.rooms.set(roomCode, room);
    console.log('방 생성 완료');

    return room;
  }

  //  
  async sendAnswerToSpringBoot(answers: any): Promise<void>{
    const springBootUrl = 'http://localhost:8080/quizResult/{quizId}';
    await lastValueFrom(this.httpService.post(springBootUrl, answers))
  }

  async sendRoomAnswersToSpringBoot(roomAnswersDto: any): Promise<void> {
    const springBootUrl = 'http://localhost:8080/quizResult/roomAnswers';
    await lastValueFrom(this.httpService.post(springBootUrl, roomAnswersDto));
  }

  //


  // joinRoom에 async를 추가합니다. 
  joinRoom(client: Socket, data: any) {
    const { roomCode, nickName } = data;
    console.log(roomCode);
    // 닉네임 정보 클라이언트 객체에 저장
    client['nickName'] = nickName;
    client['roomCode'] = `${roomCode}`;

    console.log(this.rooms);
    // 방 체크
    const room = this.rooms.get(`${roomCode}`);

    if (!room) {
      console.log('존재하지 않는 방입니다.');
      return;
    }

    // TODO: 방에 접속했다는 것을 클라이언트 객체에 저장하는 것도 나쁘지 않을지도. ??
    // 방에 이미 접속한 경우 확인
    let isAlreadyConnected = room.clients.some(c => {
      if (c === client) {
        console.log('이미 접속한 사용자입니다.');
        return true;
      }
      return false;
    });

    // 이미 접속한 클라이언트인 경우
    if (isAlreadyConnected) return -1;

    // 클라이언트 정보에 roomCode 저장
    client['roomCode'] = `${roomCode}`;

    // 방 목록에 새로운 클라이어트 추가 및 위치 정보 초기화
    room.clients.push(client);

    // 인원 수 증가
    room.clientCnt++;
    if (room.teacherId != client.id) {
      room.userlocations.set(client.id, {
        nickName: nickName,
        position: { x: 0, y: 0, z: 0 },
      });
    } else {
      return 0;
    }

    // joinRoom에 async를 추가합니다. 
    // await this.sendAnswerToSpringBoot(room.answers);
    //

    console.log(
      `${nickName}님이 코드: ${roomCode}방에 접속했습니다.`,
      client.id
    );
  }


  //

  submitAnswer(client: Socket, answer: { selectOption: any; result: any }) {
    const roomCode = client['roomCode'];
    const nickName = client['nickName'];

    const room = this.rooms.get(roomCode);
    if (!room) {
      console.log('존재하지 않는 방입니다.');
      return;
    }

    if (!room.answers[nickName]) {
      room.answers[nickName] = { selectOption: [], result: [], totalScore: 0 };
    }

    room.answers[nickName].selectOption.push(answer.selectOption as never);
    room.answers[nickName].result.push(answer.result as never);

    console.log(`Answer submitted for ${nickName} in room ${roomCode}:`, answer);

    // // Transform answers to match QuizResultDto
    // const transformedAnswers = {
    //   nickName: nickName,
    //   selectOption: room.answers[nickName].selectOption,
    //   result: room.answers[nickName].result,
    //   totalScore: this.calculateTotalScore(room.answers[nickName].result),
    // };

    // // Spring Boot 서버로 전송
    // this.sendAnswerToSpringBoot(transformedAnswers);



    const quizResultDto = {
      quizId: 154,  // quizId 값을 여기에 설정합니다.
      correctAnswer: null,
      roomCode: roomCode,
      name: nickName,
    };

    const roomAnswersDto = {
      selectOption: room.answers[nickName].selectOption,
      result: room.answers[nickName].result,
      totalScore: this.calculateTotalScore(room.answers[nickName].result),
    };

    this.sendAnswerToSpringBoot(quizResultDto);
    this.sendRoomAnswersToSpringBoot(roomAnswersDto);
  
  }



  calculateTotalScore(results: any[]): number {
    // Implement the logic to calculate total score based on results
    let totalScore = 0;
    results.forEach(result => {
      if (result) {
        totalScore += 1; // or other scoring logic
      }
    });
    return totalScore;
  }

  

  //

  exitRoom(client: Socket) {
    if (client) {
      client.disconnect();
    }
  }

  getRoom(roomCode: string): Room {
    return this.rooms.get(roomCode);
  }

  handleDisconnect(client: Socket) {
    console.log('룸코드 출력:', client['roomCode']);
    const room = this.rooms.get(client['roomCode']);
    if (!room) return;

    // 선생님인 경우
    if (room.teacherId === client.id) {
      room.open = false;
      // 선생님이 나갔을 때 방을 삭제하는 로직이 필요하다. ( 모든 학생 방 접속을 해제해야 함 )
      room.clients.forEach(c => {
        c.disconnect();
      });

      this.rooms.delete(client['roomCode']);
      // 방 목록에서 학생 제거
      room.clients = [];

      room.userlocations.clear();
    }

    if (room.open === false) return;


    console.log('disconnect cnt', room.clients.length);
    // 학생이 나갔을 때 해당 학생을 유저 목록에서 제거한다.
    room.clients = room.clients.filter(c => c.id !== client.id);
    room.userlocations.delete(client.id);
    console.log('disconnect cnt', room.clients.length);

    //학생이 나갔을 때 남아 있는 모든 학생에게 방에서 나갔다는 이벤트를 전달해야 한다.
    for (let c of this.rooms.values()) {
      c.clients.forEach(student => {
        student.emit('someoneExit', client['nickName']);
      });
    }
  }
}
