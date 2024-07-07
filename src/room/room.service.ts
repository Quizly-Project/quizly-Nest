import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import Room from 'src/interfaces/room.interface';

@Injectable()
export class RoomService {
  private rooms: Map<string, Room> = new Map();

  createRoom(client: Socket, quizGroup: any): Room {
    const teacherId = client.id;
    const roomCode = '1';

    console.log(client.id);
    if (this.rooms.has(roomCode)) {
      console.log('이미 생성된 방입니다.');
      return;
    }

    client['roomCode'] = roomCode;
    const room: Room = {
      teacherId,
      roomCode,
      clients: [client],
      userlocations: new Map(),
      answers: [],
      open: true,
      quizGroup,
      currentQuizIndex: -1,
    };

    room.userlocations.set(client.id, {
      nickName: 'teacher',
      position: { x: 0, y: 0, z: 0 },
    });

    this.rooms.set(roomCode, room);
    console.log('방 생성 완료');

    return room;
  }

  joinRoom(client: Socket, data: any) {
    console.log(data);

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
    var isAlreadyConnected = room.clients.some(c => {
      if (c === client) {
        console.log('이미 접속한 사용자입니다.');
        return true;
      }
      return false;
    });

    // 이미 접속한 클라이언트인 경우
    if (isAlreadyConnected) return;

    // 클라이언트 정보에 roomCode 저장
    client['roomCode'] = `${roomCode}`;

    // 방 목록에 새로운 클라이어트 추가 및 위치 정보 초기화
    room.clients.push(client);
    room.userlocations.set(client.id, {
      nickName: nickName,
      position: { x: 0, y: 0, z: 0 },
    });
    // console.log(room.clients);

    console.log(
      `${nickName}님이 코드: ${roomCode}방에 접속했습니다.`,
      client.id
    );
  }

  exitRoom(client: Socket) {
    if (client) {
      client.disconnect();
    }
  }

  getRoom(roomCode: string): Room {
    return this.rooms.get(roomCode);
  }

  handleDisconnect(client: Socket) {
    console.log('실행됨111');
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
    //TODO: client.id가 아닌 닉네임을 전달해줄 필요가 있다.
    //학생이 나갔을 때 남아 있는 모든 학생에게 방에서 나갔다는 이벤트를 전달해야 한다.
    for (let c of this.rooms.values()) {
      c.clients.forEach(student => {
        console.log('실행됨222');
        student.emit('someoneExit', client['nickName']);
      });
    }
  }
}
