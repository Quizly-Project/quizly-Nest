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

  // 방 목록 객체
  rooms = {};

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

    const room = this.rooms[client['roomCode']];

    if(!room) return;
    
    // 선생님인 경우
    if (room.teacherId === client.id) {
      room.open = false;
      //TODO: 선생님이 나갔을 때 방을 삭제하는 로직이 필요하다. ( 모든 학생 방 접속을 해제해야 함 )
      room.clients.forEach((c) => {
        c.disconnect();
      });
      delete this.rooms[client['roomCode']];
    }
    else {
      // 방 목록에서 학생 제거 
      delete room.clients[client.id];
      delete room.userlocations[client.id];

      if (room.open === false) return;
      //TODO: client.id가 아닌 닉네임을 전달해줄 필요가 있다. 
      //학생이 나갔을 때 남아 있는 모든 학생에게 방에서 나갔다는 이벤트를 전달해야 한다.
      for (let c of room.clients) {
        c.emit('roomOut', client.id);
      }
    }
  }

  /*
    createRoom 메서드
    선생님이 방을 생성하면 createRoom 메서드를 실행한다.
    방 코드를 생성하고 해당 방을 방 목록에 추가한다.
  */
  @SubscribeMessage('createRoom')
  createRoom(@ConnectedSocket() client) {
    //TODO: 방 생성시 스프링 서버에서 퀴즈그룹 가져와야 함 // 클라이언트에서 quizGroupId를 가져오면 된다.

    // 방 코드 생성
    const roomCode = client.id.substr(0, 8);

    if (this.rooms[roomCode]) {
      console.log("이미 생성된 방입니다.");
      return;
    }

    client['roomCode'] = roomCode;
    const room = {
      teacherId: client.id,
      roomCode: roomCode,
      clients: [client.id],
      userlocations: {},
      open: true,
      quizGroup : {}
    }

    // 방 목록에 새로 생성된 방을 추가한다. 
    this.rooms[roomCode] = room;
  }

  /*
    joinRoom 메서드
    학생이 방에 접속하면 joinRoom 메서드를 실행한다.
    해당 방에 접속한 사용자를 방 목록에 추가한다.
  */
  @SubscribeMessage('joinRoom')
  joinRoom(@MessageBody() data: { roomCode: string, nickName: string }, @ConnectedSocket() client) {
    const { roomCode, nickName } = data;

    // 닉네임 정보 클라이언트 객체에 저장 
    client['nickName'] = nickName;

    // 방 체크 
    const room = this.rooms[roomCode];
    if (!room) {
      console.log("존재하지 않는 방입니다.");
      return;
    }

    // TODO: 방에 접속했다는 것을 클라이언트 객체에 저장하는 것도 나쁘지 않을지도. ??
    // 방에 이미 접속한 경우 확인
    const isAlreadyConnected = room.clients.forEach((c) => {
      if (c === client) {
        console.log("이미 접속한 사용자입니다.");
        return true;
      }
      return false;
    });

    // 이미 접속한 클라이언트인 경우
    if (isAlreadyConnected) return;

    // TODO: 선생님은 방을 만들면 끝인가 ?? 아니면 Join을 할 필요가 있나 ?? - 없을지도.
    // 클라이언트 정보에 roomCode 저장
    client['roomCode'] = roomCode;

    // 방 목록에 새로운 클라이어트 추가 및 위치 정보 초기화  
    room.clients.push(client.id);
    room.userlocations[client.id] = {
      nickName: nickName,
      position: { x: 0, y: 0, z: 0 }
    };
    console.log(room.clients);

    console.log(`${nickName}님이 코드: ${roomCode}방에 접속했습니다.`, client.id);

    // 지금 접속한 클라이언트의 위치를 모두에게 전송
    for (let c of room.clients) {
      if (client.id == c.id)
        continue;
      c.emit('newClientPosition', room.userlocations[client.id]);
    }

    // 지금 접속한 클라이언트에게 다른 유저의 모든 정보를 전송 
    client.emit('everyonePosition', room.userlocations);

  }

  /*
    outRoom 메서드
    클라이언트가 outRoom 이벤트를 발생시키면 서버는 outRoom 메소드를 실행시킨다.
    해당 클라이언트는 소켓 연결을 해제한다.
  */
    @SubscribeMessage('exitRoom')
    outRoom(@ConnectedSocket() client) {
      if (client) {
        client.disconnect();
      }
    }
    //TODO: 강퇴기능으로 추가 필요.
    @SubscribeMessage('kickOut')
    kickOut(@MessageBody() data: string, @ConnectedSocket() client) {

    }

  /*
    movePosition 메서드
    움직인 클라이언트의 위치를 같은 방에 접속한 모든 클라이언트에게 전송
  */
  @SubscribeMessage('iMove')
  movePosition(@MessageBody() data: string, @ConnectedSocket() client) {
    // TODO: 클라이언트에서 어떤 형태로 데이터를 전송할지 확인할 필요가 있음.
    // TODO: 움직인 클라이언트의 위치를 같은 방에 접속한 모든 클라이언트에게 전송.
    // 클라이언트로부터 받을 데이터 구조 -- {roomCode, nickName, position : {x,y,z}}
    const room = this.rooms[client['roomCode']];

    for (let c of room.clients) {
      if (client.id == c.id)
        continue;
      // {nickName:"nickName", position:{x,y,z}}
      c.emit('theyMove', data);
    }
  }

  // 한 문제 시작 - quizStart, 퀴즈 그룹 시작 - start 
  @SubscribeMessage('quizStart')
  quizStart(@ConnectedSocket() client) {
    // TODO: 타이머를 가동하여 시간 측정 

    // TODO: 타이머가 종료됐을 때
    // 1. 퀴즈 정답 판정 후 결과 저장 

    // 2. 퀴즈 정답을 모든 클라이언트에게 브로드캐스트()

  }

  @SubscribeMessage('start')
  start(@ConnectedSocket() client) {
    //TODO: 퀴즈 그룹을 시작함과 동시에, 1번 퀴즈 emit 필요.(브로드캐스트)

    // 퀴즈 하나 객체가 전달 됨 
    //client.emit('quiz', );
  }
}

// handleDisconnect(client) {
//   console.log(`Client disconnected: ${client.id}`);
//   // 웹 소켓과 연결 해제시 사용자 목록에서 제거
//   console.log("aaaaa",client.id);
//   var exitNickName = this.userlocations[client.id][0];
//   console.log(exitNickName);
//   this.wsClients = this.wsClients.filter(c => c.id !== client.id);
//   //TODO: 사용자 위치 정보도 제거해줘야 한다. 현재 닉네임을 키로 사용자를 구분하고 있음. 하지만 현재 닉네임을 저장하고 있지 않음.
//   delete this.userlocations[client.id]; // 사용자 위치 정보 제거

//   for (let c of this.wsClients) {
//     c.emit('roomOut', exitNickName);
//   }
// }
/*
  connectSomeone 메서드
  클라이언트가 room 이벤트를 발생시키면 서버는 connectSomeone 메소드를 실행한다.
  클라이언트가 퀴즈방에 접속하면 사용자 목록에 추가한다.
*/
//TODO: room을 roomIN으로 변경해줄 필요가 있다.
// @SubscribeMessage('room')
// connectSomeone(@MessageBody() data: { nickname: string, room: string }, @ConnectedSocket() client) {

//   //TODO: 쿠키로 사용자를 구분할 필요가 있음 !!
//   // 이미 접속한 사용자인지 확인
//   const isAlreadyConnected = this.wsClients.some((curr) => {
//     if (curr === client) {
//       console.log("이미 접속한 사용자입니다.", this.wsClients.length);
//       return true;
//     }
//     return false;
//   });

//   if (isAlreadyConnected) return;

//   // 클라이언트가 보낸 데이터를 배열로 변환
//   const { nickname, room } = data;
//   console.log(`${nickname}님이 코드: ${room}방에 접속했습니다.`, client.id);

//   // 서버에서 클라이언트로 comeOn 이벤트를 발생시킨다.(닉네임 전달);
//   this.server.emit('comeOn', nickname);

//   // 방에 접속한 유저 목록에 추가
//   this.wsClients.push(client);

//   // 입장한 유저의 초기 위치
//   const initialValue = { x: 0, y: 0, z: 0 };


//   this.userlocations[client.id] = [nickname, initialValue];

//   /*
//     서버 -> 클라이언트
//     roomIn 이벤트를 발생시켜 클라이언트에게 이전에 접속한 모든 유저 위치값을 전달한다.
//   */

//   //TODO: 현재 클라이언트에게 client.id가 전달되고 있음, 보안을 위해 이를 막아줄 필요가 있다.
//   client.emit("roomIn", this.userlocations);
// }

// /*
//   disconnectClient 메서드
//   퀴즈방에서 나갈 때 사용자 목록에서 제거
// */
// @SubscribeMessage('RoomOut')
// disconnectClient(client) {
//   console.log(client.id);

//   var exitNickName = this.userlocations[client.id][0];
//   console.log(exitNickName);
//   this.wsClients = this.wsClients.filter(c => c.id !== client.id); // 배열에서 제거
//   delete this.userlocations[client.id]; // 사용자 위치 정보 제거

//   for (let c of this.wsClients) {
//     console.log("1");
//     c.emit('roomOut', exitNickName);
//   }
// }

// // 모든 유저에게 브로드캐스트하는 메서드
// private broadcast(event, client, message: any) {
//   //console.log(client);
//   for (let c of this.wsClients) {
//     if (client.id == c.id)
//       continue;
//     c.emit(event, message);
//   }
// }

// /*
//   sendMessage 메서드
//   사용자가 움직일 때마다 send 이벤트를 발생시킨다.'
//   그 때 해당 메서드가 실행되어 모든 클라이언트에게 사용자 위치를 브로드케스트한다.
// */
// @SubscribeMessage('send')
// sendMessage(@MessageBody() data: string, @ConnectedSocket() client) {
//   const [room, nickname, message] = data;

//   console.log("message", message, client.id);

//   this.userlocations[client.id] = [nickname, message];
//   this.broadcast(room, client, [nickname, message]);

//   // 접속자 목록
//   // this.wsClients.forEach((client,i)=>{
//   //   console.log(i,client.id);
//   // })
// }

