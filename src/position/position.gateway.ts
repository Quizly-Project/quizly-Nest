import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'http';

// localhost:81/quizly - 웹 소켓 엔드포인트
@WebSocketGateway(81, {
  namespace: 'quizly',
  cors: { origin: '*' },
})
export class PositionGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // 접속한 유저 목록 
  wsClients = [];
  
  
  

  // 접속 중인 유저 위치 정보 ( nickname : {x,y,z})
  userlocations = {};

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
    // 웹 소켓과 연결 해제시 사용자 목록에서 제거
    var exitNickName = this.userlocations[client.id][0];
    console.log(exitNickName);
    this.wsClients = this.wsClients.filter(c => c.id !== client.id);
    //TODO: 사용자 위치 정보도 제거해줘야 한다. 현재 닉네임을 키로 사용자를 구분하고 있음. 하지만 현재 닉네임을 저장하고 있지 않음.  
    delete this.userlocations[client.id]; // 사용자 위치 정보 제거

    for (let c of this.wsClients) {
      console.log("1");
      c.emit('roomOut', exitNickName);
    }
  }

  /*
    connectSomeone 메서드
    클라이언트가 room 이벤트를 발생시키면 서버는 connectSomeone 메소드를 실행한다.
    클라이언트가 퀴즈방에 접속하면 사용자 목록에 추가한다.
  */
  //TODO: room을 roomIN으로 변경해줄 필요가 있다.
  @SubscribeMessage('room')
  connectSomeone(@MessageBody() data: string, @ConnectedSocket() client) {

    //TODO: 쿠키로 사용자를 구분할 필요가 있음 !!
    // 이미 접속한 사용자인지 확인
    const isAlreadyConnected = this.wsClients.some((curr) => {
      if (curr === client) {
        console.log("이미 접속한 사용자입니다.", this.wsClients.length);
        return true;
      }
      return false;
    });

    if (isAlreadyConnected) return;

    // 클라이언트가 보낸 데이터를 배열로 변환
    const [nickname, room] = data;
    console.log(`${nickname}님이 코드: ${room}방에 접속했습니다.`, client.id);

    // 서버에서 클라이언트로 comeOn 이벤트를 발생시킨다.(닉네임 전달);
    this.server.emit('comeOn', nickname);

    // 방에 접속한 유저 목록에 추가
    this.wsClients.push(client);

    // 입장한 유저의 초기 위치 
    const initialValue = { x: 0, y: 0, z: 0 };

    this.userlocations[client.id] = [ nickname , initialValue ];

    /*
      서버 -> 클라이언트
      roomIn 이벤트를 발생시켜 클라이언트에게 이전에 접속한 모든 유저 위치값을 전달한다.
    */

    //TODO: 현재 클라이언트에게 client.id가 전달되고 있음, 보안을 위해 이를 막아줄 필요가 있다.
    client.emit("roomIn", this.userlocations);
  }
  
  /*
    disconnectClient 메서드 
    퀴즈방에서 나갈 때 사용자 목록에서 제거
  */
  @SubscribeMessage('RoomOut')
  disconnectClient(client) {
    console.log(client.id);

    var exitNickName = this.userlocations[client.id][0];
    console.log(exitNickName);
    this.wsClients = this.wsClients.filter(c => c.id !== client.id); // 배열에서 제거
    delete this.userlocations[client.id]; // 사용자 위치 정보 제거

    for (let c of this.wsClients) {
      console.log("1");
      c.emit('roomOut', exitNickName);
    }
  }

  // 모든 유저에게 브로드캐스트하는 메서드
  private broadcast(event, client, message: any) {
    //console.log(client);
    for (let c of this.wsClients) {
      if (client.id == c.id)
        continue;
      c.emit(event, message);
    }
  }

  /*
    sendMessage 메서드  
    사용자가 움직일 때마다 send 이벤트를 발생시킨다.'
    그 때 해당 메서드가 실행되어 모든 클라이언트에게 사용자 위치를 브로드케스트한다.
  */
  @SubscribeMessage('send')
  sendMessage(@MessageBody() data: string, @ConnectedSocket() client) {
    const [room, nickname, message] = data;

    console.log("message", message, client.id);

    this.userlocations[client.id] = [nickname, message];
    this.broadcast(room, client, [nickname, message]);

    // 접속자 목록 
    // this.wsClients.forEach((client,i)=>{
    //   console.log(i,client.id);
    // })
  }
}
