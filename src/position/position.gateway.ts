import {
  ConnectedSocket,
  MessageBody,
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
export class PositionGateway {
  @WebSocketServer()
  server: Server;

  // 접속한 유저 목록 
  wsClients = [];

  // 접속 중인 유저 위치 정보 ( nickname : {x,y,z})
  userlocations = {};
  
  /*
    클라이언트가 room 이벤트를 발생시키면 서버는 connectSomeone 메소드를 실행한다.
  */
  //TODO: room을 roomIN으로 변경해줄 필요가 있다.
  @SubscribeMessage('room')
  connectSomeone(@MessageBody() data: string, @ConnectedSocket() client){
    
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

    // 접속한 유저 목록에 추가
    this.wsClients.push(client);

    // 입장한 유저의 초기 위치 
    const initialValue = { x : 0, y : 0, z : 0 };
    
    this.userlocations[nickname] = initialValue;

    /*
      서버 -> 클라이언트
      roomIn 이벤트를 발생시켜 클라이언트에게 이전에 접속한 모든 유저 위치값을 전달한다.
    */
    client.emit("roomIn", this.userlocations);
  }

  //TODO: out을 roomOUT으로 변경해줄 필요가 있다.
  @SubscribeMessage('out')
  disconnectClient(client) {
    client.disconnect(); // 클라이언트 접속 끊기
    console.log(client.id);
    this.wsClients = this.wsClients.filter(c => c.id !== client.id); // 배열에서 제거
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
    사용자가 움직일 때마다 send 이벤트를 발생시킨다.'
    그 때 해당 메서드가 실행되어 모든 클라이언트에게 사용자 위치를 브로드케스트한다.
  */ 
  @SubscribeMessage('send')
  sendMessage(@MessageBody() data: string, @ConnectedSocket() client) {
    const [room, nickname, message] = data;
  
    console.log("message", message, client.id);

    this.userlocations[nickname] = message;
    this.broadcast(room, client, [nickname, message]);

    // 접속자 목록 
    // this.wsClients.forEach((client,i)=>{
    //   console.log(i,client.id);
    // })
  }
}
