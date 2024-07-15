import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { QuizService } from '../quiz/quiz.service';
import { RoomService } from '../room/room.service';
import { UserPositionService } from 'src/userPosition/userPosition.service';
import { PlayService } from 'src/play/play.service';

// localhost:81/quizly - 웹 소켓 엔드포인트
@WebSocketGateway(3004, {
  // mod
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
  ) {}
  @WebSocketServer()
  server: Server;

  /*
    handleConnection 메서드
    클라이언트가 서버에 접속하면 실행되는 메서드
  */
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  /*
    handleDisconnect 메서드
    클라이언트가 서버에서 접속을 끊으면 실행되는 메서드  
  */
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.roomService.handleDisconnect(client);
  }

  /*
    createRoom 메서드
    선생님이 방을 생성하면 createRoom 메서드를 실행한다.
    방 코드를 생성하고 해당 방을 방 목록에 추가한다.
  */
  @SubscribeMessage('createRoom')
  async createRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() quizGroupId: string
  ) {
    console.log('createRoom 메서드 실행 -> 방 생성 시도. ');
    let quizGroup;
    try {
      console.log('quizGroup:', quizGroup);
      console.log('quizGroupId:', quizGroupId);
      quizGroup = await this.quizService.getQuizGroup(quizGroupId['quizGroup']);
    } catch (error) {
      client.emit('error', {
        success: false,
        message: '퀴즈 그룹을 불러오지 못했습니다.',
      });
      throw new Error('뀨 Spring 서버에 접근 못함');
    }

    const room = this.roomService.createRoom(client, quizGroup);
    if (room === undefined) {
      client.emit('error', { success: false, message: '방 생성 실패' });
      console.log('방 생성 실패.');
      return;
    }
    client.emit('roomCode', room.roomCode);
    console.log('방 생성 성공.');
  }

  /*
    checkRoom 메서드
    학생이 방에 접속하기 전에 방이 존재하는지 확인하는 메서드
  */
  @SubscribeMessage('checkRoom')
  checkRoom(@MessageBody() roomCode: string) {
    console.log('checkRoom 메서드 실행 -> 방 존재 여부 확인.');
    let room = this.roomService.getRoom(roomCode);
    if (!room) {
      console.log('방 존재 X');
      return { success: false, message: '방이 존재하지 않습니다.' };
    }
    console.log('방 존재 O');
    return {
      success: true,
      message: '방이 존재합니다.',
      quizType: room.quizGroup.quizzes[0].type,
    };
  }

  /*
    joinRoom 메서드
    학생이 방에 접속하면 joinRoom 메서드를 실행한다.
    해당 방에 접속한 사용자를 방 목록에 추가한다.
  */
  @SubscribeMessage('joinRoom')
  async joinRoom(
    @MessageBody() data: { roomCode: any; nickName: string },
    @ConnectedSocket() client: Socket
  ) {
    console.log('joinRoom 메서드 실행 -> 방 참가 시도. ');
    if (!data.roomCode === undefined || data.nickName === undefined) {
      return { success: false, message: '방 코드 혹은 닉네임이 없습니다.' };
    }
    try {
      console.log(`Join room request received: ${JSON.stringify(data)}`);
      const result = await this.roomService.joinRoom(client, data);

      console.log('joinRoom result:', data.roomCode, data.nickName, result);
      if (result.success) {
        await this.userPositionService.sendAllUserPositions(client);
        if (result.userType === 'student') {
          await this.userPositionService.broadcastNewUserPosition(client);
        }
        return {
          success: true,
          message: result.message,
          userType: result.userType,
          quizType: result.quizType,
        };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Error in joinRoom:', error);
      return { success: false, message: 'Internal server error' };
    }
  }

  /*
    outRoom 메서드
    클라이언트가 outRoom 이벤트를 발생시키면 서버는 outRoom 메소드를 실행시킨다.
    해당 클라이언트는 소켓 연결을 해제한다.
  */
  @SubscribeMessage('exitRoom')
  exitRoom(@ConnectedSocket() client: Socket) {
    this.roomService.exitRoom(client);
  }

  /*
    kickOut 메서드
    클라이언트가 'kickOut 이벤트를 발생시키면 서버는 해당 클라이언트가 전송한 데이터를 이용하여 상대방을 강퇴한다.
  */
  @SubscribeMessage('kickOut')
  kickOut(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    const { roomCode, nickName } = data;
    const room = this.roomService.getRoom(roomCode);
    if (!room) {
      client.emit('error', {
        success: false,
        message: '방이 존재하지 않습니다.',
      });
      return;
    }

    const target: Socket = room.clients.find(
      client => client['nickName'] === nickName
    );
    if (!target) {
      client.emit('error', {
        success: false,
        message: '해당 사용자가 방에 존재하지 않습니다.',
      });
      return;
    }

    target.disconnect();
  }

  /*
    movePosition 메서드
    움직인 클라이언트의 위치를 같은 방에 접속한 모든 클라이언트에게 전송
  */
  @SubscribeMessage('iMove')
  movePosition(
    @MessageBody()
    data: { nickName: string; position: { x: number; y: number; z: number } },
    @ConnectedSocket() client: Socket
  ) {
    const { nickName, position } = data;
    if (nickName === undefined || position === undefined) {
      client.emit('error', {
        success: false,
        message: '닉네임 또는 움직임에 대한 정보가 없습니다.',
      });
      return;
    }
    this.userPositionService.broadcastUserPosition(client, nickName, position);
  }

  // 한 문제 시작 - quizStart, 퀴즈 그룹 시작 - start
  @SubscribeMessage('nextQuiz')
  quizStart(@ConnectedSocket() client: Socket) {
    let room = this.roomService.getRoom(client['roomCode']);
    if (!room) {
      client.emit('error', {
        success: false,
        message: '방이 존재하지 않습니다.',
      });
      return;
    }

    // 다음 퀴즈 실행하기
    this.playService.startNextQuiz(room, this.server);
  }

  /*
    start 메서드
    퀴즈를 시작하는 메서드
   */
  @SubscribeMessage('start')
  start(@ConnectedSocket() client: Socket, @MessageBody() roomCode: string) {
    let room = this.roomService.getRoom(roomCode);
    if (!room) {
      client.emit('error', {
        success: false,
        message: '방이 존재하지 않습니다.',
      });
      return;
    }
    console.log('퀴즈 그룹 시작');

    this.playService.startQuiz(client, this.server);
  }

  /*
    isWriting 메서드
    사용자가 답안 작성 여부를 서버에 전송할 때 실행되는 메서드 
   */
  @SubscribeMessage('isWriting')
  isWriting(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomCode: string; writeStatus: string }
  ) {
    const { roomCode, writeStatus } = data;
    let room = this.roomService.getRoom(roomCode);
    if (!room) {
      client.emit('error', {
        success: false,
        message: '방이 존재하지 않습니다.',
      });
      return;
    }
    this.playService.updateWriteState(client, writeStatus, room);
  }

  /*
    submitAnswer 메서드
    사용자가 답안을 제출할 때 실행되는 메서드
   */
  @SubscribeMessage('submitAnswer')
  submitAnswer(
    @ConnectedSocket() client,
    @MessageBody() data: { roomCode: string; answer: string; nickName: string }
  ) {
    const { roomCode, answer, nickName } = data;
    let room = this.roomService.getRoom(roomCode);
    if (!room) {
      client.emit('error', {
        success: false,
        message: '방이 존재하지 않습니다.',
      });
      return;
    }

    if (room.currAnswerList[nickName] === undefined) {
      client.emit('error', {
        success: false,
        message: '참가자가 아닙니다.',
      });
      return;
    }
    room.currAnswerList[nickName].answer = answer;
    this.playService.updateWriteState(client, 'Done', room);
  }
  /*
    getQuizResult 메서드
    퀴즈 결과를 가져오는 메서드
  */
  @SubscribeMessage('getQuizResult')
  async getQuizResult(
    @ConnectedSocket() client,
    @MessageBody() data: { roomCode: string }
  ) {
    const { roomCode } = data;
    let result = await this.quizService.getQuizResult(roomCode);
    console.log('퀴즈 결과 가져오기', result);
    return result;
  }

  /*
    getQuizRoom 메서드
    퀴즈방 정보를 가져오는 메서드 (테스트용)
   */
  @SubscribeMessage('getQuizRoom')
  async getQuizRoom(
    @ConnectedSocket() client,
    @MessageBody() data: { roomCode: string }
  ) {
    const { roomCode } = data;
    console.log('roomCode : ', roomCode);
    let result = await this.quizService.getQuizRoom(roomCode);
    console.log('퀴즈방 기록하기', result);
    return result;
  }

  /*
    postQuizRoom 메서드
    퀴즈방 정보를 기록하는 메서드 (테스트용)
   */
  @SubscribeMessage('postQuizRoom')
  async postQuizRoom(
    @ConnectedSocket() client,
    @MessageBody() data: { roomCode: string }
  ) {
    const { roomCode } = data;
    console.log('roomCode : ', roomCode);
    let result = await this.quizService.postQuizRoom(roomCode);
    console.log('퀴즈방 기록하기', result);
    return result;
  }

  private intervalId: NodeJS.Timeout;
  private cnt = 0;
  @SubscribeMessage('startSend')
  sendStart(@ConnectedSocket() client: Socket) {
    if (!this.intervalId) {
      this.intervalId = setInterval(() => this.checkPrint(), 1000 / 30);
      console.log('수행시작');
    }
  }

  @SubscribeMessage('endSend')
  sendEnd(@ConnectedSocket() client: Socket) {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      console.log('수행끝');
    }
  }

  checkPrint() {
    console.log(++this.cnt);
  }
}
