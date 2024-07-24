import { Injectable } from '@nestjs/common';

import { Socket } from 'socket.io';
import Room from 'src/interfaces/room.interface';
import Position from 'src/interfaces/room.interface';
import { MonitorService } from 'src/monitor/monitor.service';
import { RoomService } from 'src/room/room.service';
@Injectable()
export class UserPositionService {
  constructor(
    private roomService: RoomService,
    private moniroService: MonitorService
  ) {}
  //유저 좌표

  private respawnPos = [
    { x: 10, y: 15, z: 10 },
    { x: 10, y: 15, z: 5 },
    { x: 10, y: 15, z: 0 },
    { x: 10, y: 15, z: -5 },
    { x: 10, y: 15, z: -10 },
    { x: 5, y: 15, z: 10 },
    { x: 5, y: 15, z: 5 },
    { x: 5, y: 15, z: 0 },
    { x: 5, y: 15, z: -5 },
    { x: 5, y: 15, z: -10 },
    { x: 0, y: 15, z: -10 },
    { x: 0, y: 15, z: 5 },
    { x: 0, y: 15, z: 0 },
    { x: 0, y: 15, z: -5 },
    { x: 0, y: 15, z: -10 },
    { x: 10, y: 15, z: 10 },
    { x: -5, y: 15, z: -10 },
    { x: -5, y: 15, z: 5 },
    { x: -5, y: 15, z: 0 },
    { x: -5, y: 15, z: -5 },
    { x: -5, y: 15, z: -10 },
    { x: -5, y: 15, z: 10 },
    { x: -10, y: 15, z: 5 },
    { x: -10, y: 15, z: -5 },
    { x: -10, y: 15, z: -5 },
    { x: -10, y: 15, z: 10 },
  ];

  suffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  }

  /*
    broadcastNewUserPosition 메서드
    새로운 클라이언트의 위치를 방에 있는 모든 클라이언트에게 전달
  */
  broadcastNewUserPosition(client: Socket) {
    // 클라이언트의 방 코드를 이용해 방 정보를 가져온다.
    const room = this.roomService.getRoom(client['roomCode']);
    if (!room) {
      client.emit('error', { success: false, message: '방이 없습니다.' });
      return;
    }
    // 방에 있는 모든 클라이언트에게 새로운 클라이언트의 위치를 전달
    room.clients.forEach(c => {
      if (c === client) return;
      c.emit('newClientPosition', {
        userlocations: room.userlocations.get(client.id),
        clientInfo: this.roomService.getClientInfo(client['roomCode']),
        modelMapping: client['modelMapping'],
      });
    });
  }

  /*
    sendAllUserPositions 메서드
    방에 있는 모든 클라이언트의 위치를 요청한 클라이언트에게 전달 
  */
  sendAllUserPositions(client: Socket) {
    const room = this.roomService.getRoom(client['roomCode']);
    if (!room) {
      client.emit('error', { success: false, message: '방이 없습니다.' });
      return;
    }

    for (let c of room.clients) {
      if (room['teacherId'] === c.id) continue;
      let mylocation = room.userlocations.get(c.id);
      mylocation['modelMapping'] = c['modelMapping']['name'];
      mylocation['texture'] = c['modelMapping']['texture'];
    }

    client.emit('everyonePosition', {
      userlocations: Object.fromEntries(room.userlocations),
      clientInfo: this.roomService.getClientInfo(client['roomCode']),
      quizCnt: room.quizlength,
      modelMapping: client['modelMapping'],
    });
  }

  /*
    broadcastUserPosition 메서드
    클라이언트의 위치를 다른 모든 클라이언트에게 전달 
  */
  broadcastUserPosition(client: Socket, nickName: string, position: any) {
    const roomCode = client['roomCode'];
    if (!roomCode) {
      client.emit('error', { success: false, message: '방 코드가 없습니다.' });
      return;
    }
    const room = this.roomService.getRoom(roomCode);
    if (!room) {
      client.emit('error', { success: false, message: '방이 없습니다.' });
      return;
    }

    //맵을 벗어난 유저들을 0,500,0으로 다시 렌더링 //interval 이나 sleep 줘서 다 떨어지면 검사
    const Coord = room.userlocations.get(client.id);
    if (Coord.position.y < -1000) {
      Coord.position.y = 15;
      client.emit('collision', Coord.position);
    }

    this.roomService.checkCollision(client, client['nickName'], position);
  }

  /*
    checkArea 메서드
    O, X 판정을 위한 메서드 
  */
  checkArea(room, client: Socket): number {
    if (room.userlocations[client.id].position.x < 0) {
      // 0이 O
      return 0;
    } else if (room.userlocations[client.id].position.x > 0) {
      // 1이 X
      return 1;
    }
  }
  /*
    initPlayerPosition 메서드
    플레이어의 위치 초기화(랜덤 위치 값)
  */
  initPlayerPosition(room: Room) {
    const shuffledRespawnPos = this.suffleArray(this.respawnPos);
    let i = 0;
    for (const [key, value] of room.userlocations) {
      value.position = shuffledRespawnPos[i++];
    }

    for (let c of room.clients) {
      if (c.id === room.teacherId) continue;
      console.log(c['nickName']);
      c.emit('collision', room.userlocations.get(c.id)['position']);
    }
  }

  broadCastPosition(client: Socket) {
    const room = this.roomService.getRoom(client['roomCode']);
    if (!room) {
      client.emit('error', { success: false, message: '방이 없습니다.' });
      return;
    }
    for (let c of room.clients) {
      c.emit('testPosition', room.userlocations);
    }
  }
}
