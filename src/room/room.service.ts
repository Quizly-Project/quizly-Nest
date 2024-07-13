import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import Room from 'src/interfaces/room.interface';
import RoomInfo from 'src/interfaces/roomInfo.interface';
@Injectable()
export class RoomService {
  private rooms: Map<string, Room> = new Map();
  //private chatRooms: Map<st
  private modelNameList = [
    'Turtle_Animations.glb',
    'Tuna_Animations.glb',
    'Seagull_Animations.glb',
    'Sardine_Animations.glb',
    'Salmon_Animations.glb',
    'Prawn_Animations.glb',
    'Octopus_Animations.glb',
    'Jellyfish_Animations.glb',
  ];

  private textureList = [
    'M_Turtle',
    'M_Tuna',
    'M_Seagull',
    'M_Sardine',
    'M_Salmon',
    'M_Prawn',
    'M_Octopus',
    'M_Jellyfish',
  ];

  createRoom(client: Socket, quizGroup: any): Room {
    const teacherId = client.id;
    const roomCode = teacherId.substr(0, 4);

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
      quizlength: quizGroup.quizzes.length,
      currentQuizIndex: -1,
      modelList: [],
      modelMapping: new Map(),
    };

    this.initModelList(room);

    this.rooms.set(roomCode, room);

    return room;
  }

  /*
    모델 리스트 초기화 메서드
  */
  initModelList(room: Room): any {
    for (let model = 0; model < this.modelNameList.length; model++) {
      room.modelList.push({
        name: this.modelNameList[model],
        texture: this.textureList[model],
        state: false,
      });
    }
  }

  selectModel(client, room) {
    if (room.modelMapping.has(client.id)) {
      console.log('이미 모델을 가지고 있습니다.');
      return;
    }
    for (let model = 0; model < room.modelList.length; model++) {
      if (room.modelList[model].state === false) {
        room.modelMapping.set(client.id, {
          modelNum: model,
          name: this.modelNameList[model],
          texture: this.textureList[model],
        });

        room.modelList[model].state = true;

        client['modelMapping'] = room.modelMapping.get(client.id);
        client.emit('selectModel', room.modelMapping.get(client.id));
        break;
      }
    }
  }

  joinRoom(client: Socket, data: any) {
    const { roomCode, nickName } = data;
    console.log(`Attempting to join room: ${roomCode}`);

    // 방 체크
    const room = this.rooms.get(roomCode);
    if (!room) {
      client.disconnect();
      console.log(`Room not found: ${roomCode}`);
      return { success: false, message: 'Room not found' };
    }

    // 방에 이미 접속한 경우 확인
    let isAlreadyConnected = room.clients.some(c => c.id === client.id);

    if (isAlreadyConnected) {
      console.log(`User already connected: ${nickName}`);
      return { success: false, message: 'Already connected' };
    }

    // 클라이언트 정보 저장
    client['nickName'] = nickName;
    client['roomCode'] = roomCode;

    // 방 목록에 새로운 클라이언트 추가 및 위치 정보 초기화
    room.clients.push(client);

    // 인원 수 증가
    room.clientCnt++;
    const type = room.quizGroup.quizzes[0].type;
    console.log('퀴즈 타입:', type);
    if (room.teacherId !== client.id) {
      this.selectModel(client, room);
      room.userlocations.set(client.id, {
        nickName: nickName,
        position: { x: 0, y: 0, z: 0 },
      });

      console.log(`${nickName} (학생) joined room: ${roomCode}`);

      return {
        success: true,
        message: 'Joined as student',
        userType: 'student',
        quizType: type,
      };
    } else {
      console.log(`${nickName} (선생님) joined room: ${roomCode}`);
      return {
        success: true,
        message: 'Joined as teacher',
        userType: 'teacher',
      };
    }
  }

  kickOut(client: Socket) {
    client.disconnect();
  }

  exitRoom(client: Socket) {
    if (client) {
      client.disconnect();
    }
  }

  getRoom(roomCode: string): Room {
    return this.rooms.get(roomCode);
  }

  getClientInfo(roomCode: string) {
    const room = this.rooms.get(roomCode);
    if (!room) {
      return { success: false, message: '방이 없습니다.' };
    }
    const clients = room.clients.filter(c => c.id !== room.teacherId);
    const length = clients.length;
    const clientInfo = {
      clients: clients.map(c => c['nickName']),
      clientCnt: length,
    };

    return clientInfo;
  }

  getQuizInfo(roomCode: string) {
    const room = this.rooms.get(roomCode);
    if (!room) {
      return { success: false, message: '방이 없습니다.' };
    }
    const quizInfo = {
      quizCnt: room.quizGroup.quizzes.length,
      currentQuizIndex: room.currentQuizIndex,
    };

    return quizInfo;
  }

  getRoomInfo(roomCode: string) {
    const room = this.rooms.get(roomCode);
    if (!room) {
      return { success: false, message: '방이 없습니다.' };
    }
    const roomInfo: RoomInfo = {
      clientCnt: room.clientCnt,
      clients: room.clients.map(c => c['nickName']),
      quizCnt: room.quizGroup.quizzes.length,
      currentQuizIndex: room.currentQuizIndex,
    };

    for (let c of room.clients) {
      c.emit('roomInfo', roomInfo);
    }
  }

  handleDisconnect(client: Socket) {
    console.log('룸코드 출력:', client['roomCode']);

    const room: Room = this.rooms.get(client['roomCode']);
    if (!room) {
      client.emit('error', { success: false, message: '방이 없습니다.' });
      return;
    }

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
      room.modelList = [];
      room.clientCnt = 0;
      room.userlocations.clear();
      room.modelMapping.clear();
    }

    if (room.open === false) return;

    // 학생이 나갔을 때 해당 학생을 유저 목록에서 제거한다.
    room.clients = room.clients.filter(c => c.id !== client.id);

    let modelNum = room.modelMapping.get(client.id)['modelNum'];
    room.modelList[modelNum].state = false;
    room.modelMapping.delete(client.id);
    room.userlocations.delete(client.id);
    room.modelList;
    room.clientCnt--;

    //학생이 나갔을 때 남아 있는 모든 학생에게 방에서 나갔다는 이벤트를 전달해야 한다.
    for (let c of this.rooms.values()) {
      c.clients.forEach(student => {
        student.emit('someoneExit', {
          nickName: client['nickName'],
          clientInfo: this.getClientInfo(client['roomCode']),
        });
      });
    }
  }
}
