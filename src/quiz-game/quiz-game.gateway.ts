import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { QuizService } from '../quiz/quiz.service';
import { RoomService } from '../room/room.service';
import { UserPositionService } from 'src/userPosition/userPosition.service';
import { PlayService } from 'src/play/play.service';

// localhost:81/quizly - 웹 소켓 엔드포인트
@WebSocketGateway(81, {
  namespace: 'quizly',
  cors: { origin: '*' },
})
export class QuizGameGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private quizService: QuizService,
    private roomService: RoomService,
    private userPositionService: UserPositionService,
    private playService: PlayService
  ) {
    this.quizService = quizService;
    this.roomService = roomService;
    this.userPositionService = userPositionService;
  }
  @WebSocketServer()
  server: Server;

  /*
    handleConnection 메서드
    클라이언트가 서버에 접속하면 실행되는 메서드
  */
  handleConnection(client) {
    console.log(`Client connected: ${client.id}`);
  }

  /*
    handleDisconnect 메서드
    클라이언트가 서버에서 접속을 끊으면 실행되는 메서드  
  */
  handleDisconnect(client) {
    console.log(`Client disconnected: ${client.id}`);

    this.roomService.handleDisconnect(client);
  }

  /*
    createRoom 메서드
    선생님이 방을 생성하면 createRoom 메서드를 실행한다.
    방 코드를 생성하고 해당 방을 방 목록에 추가한다.
  */
  @SubscribeMessage('createRoom')
  createRoom(@ConnectedSocket() client, @MessageBody() quizGroupId: any) {
    //TODO: 방 생성시 스프링 서버에서 퀴즈그룹 가져와야 함 // 클라이언트에서 quizGroupId를 가져오면 된다.
    // const quizGroup = this.quizService.getQuizGroup(quizGroupId);

    const room = this.roomService.createRoom(client, quizGroup);
    if (room === undefined) return;
    client.emit('roomCode', room.roomCode);
  }

  /*
    joinRoom 메서드
    학생이 방에 접속하면 joinRoom 메서드를 실행한다.
    해당 방에 접속한 사용자를 방 목록에 추가한다.
  */
  @SubscribeMessage('joinRoom')
  joinRoom(
    @MessageBody() data: { roomCode: string; nickName: string },
    @ConnectedSocket() client
  ) {
    let result = this.roomService.joinRoom(client, data);
    if (result === undefined) return;

    // 지금 접속한 클라이언트에게 다른 유저의 모든 정보를 전송
    if (result === -1) return;
    this.userPositionService.sendAllUserPositions(client);

    if (result === 0) return;
    this.userPositionService.broadcastNewUserPosition(client);
  }

  /*
    outRoom 메서드
    클라이언트가 outRoom 이벤트를 발생시키면 서버는 outRoom 메소드를 실행시킨다.
    해당 클라이언트는 소켓 연결을 해제한다.
  */
  @SubscribeMessage('exitRoom')
  exitRoom(@ConnectedSocket() client) {
    this.roomService.exitRoom(client);
  }

  //TODO: 강퇴기능으로 추가 필요.
  @SubscribeMessage('kickOut')
  kickOut(@MessageBody() data: string, @ConnectedSocket() client) {}

  /*
    movePosition 메서드
    움직인 클라이언트의 위치를 같은 방에 접속한 모든 클라이언트에게 전송
  */
  @SubscribeMessage('iMove')
  movePosition(@MessageBody() data, @ConnectedSocket() client) {
    console.log('움직임', data);

    // 클라이언트로부터 받을 데이터 구조 -- {roomCode, nickName, position : {x,y,z}}
    this.userPositionService.broadcastUserPosition(client, data);
  }

  // 한 문제 시작 - quizStart, 퀴즈 그룹 시작 - start
  @SubscribeMessage('nextQuiz')
  quizStart(@ConnectedSocket() client) {
    let room = this.roomService.getRoom(client.roomCode);
    // 다음 퀴즈 실행하기
    this.playService.startNextQuiz(room, this.server);
  }

  @SubscribeMessage('start')
  start(@ConnectedSocket() client: any, @MessageBody() roomCode: string) {
    //TODO: 퀴즈 그룹을 시작함과 동시에, 1번 퀴즈 emit 필요.(브로드캐스트)
    // 퀴즈 하나 객체가 전달 됨(서버 -> 클라)
    // client.emit('quiz', );
    let room = this.roomService.getRoom(roomCode);
    console.log('퀴즈 그룹 시작');

    this.playService.startQuiz(client, this.server);
  }

  @SubscribeMessage('quizTest')
  quizTest(@MessageBody() data, @ConnectedSocket() client) {
    const room = this.roomService.getRoom(data);
    this.playService.quizResultSaveLocal(room, 1);
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
  quizzes: [
    {
      quizId: 1,
      type: 1,
      question: '질문1',
      correctAnswer: '0',
      quizScore: 30,
      time: 3,
      options: [],
    },
    {
      quizId: 2,
      type: 2,
      question: '질문2',
      correctAnswer: '1',
      quizScore: 30,
      time: 4,
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
      time: 5,
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
