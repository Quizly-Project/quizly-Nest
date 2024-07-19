import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import Position from 'src/interfaces/room.interface';
import { RoomService } from 'src/room/room.service';
import { CollisionDetectionService } from 'src/collisionDetection/collision-detection.service';
import CharacterInfo from 'src/interfaces/characterInfo.interface';
import Room  from 'src/interfaces/room.interface';
import Collision from 'src/interfaces/collision.interface';
@Injectable()
export class UserPositionService {
  constructor(
    private roomService: RoomService,
    private collisionDetectionService: CollisionDetectionService 
  ) {}

  //유저 좌표
  private userPosition: Map<string, CharacterInfo> = new Map();

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
    const userLocation = room.userlocations.get(client.id);
    if (!userLocation) {
      client.emit('error', {
        success: false,
        message: '유저 위치 정보가 없습니다.',
      });
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

    const userLocations = new Map<string, CharacterInfo & { modelMapping?: string, texture?: string }>();
    for (const [id, location] of room.userlocations) {
      if (room['teacherId'] === id) continue;
      const client = room.clients.find(c => c.id === id);
      if (client && client['modelMapping']) {
        userLocations.set(id, {
          ...location,
          modelMapping: client['modelMapping']['name'],
          texture: client['modelMapping']['texture']
        });
      } else {
        userLocations.set(id, location);
      }
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

    const updatedCharacterInfo: CharacterInfo = {
      nickName: nickName,
      position: position,
      radius: 5, //기본 충돌 반경
      lastCollisionTime: Date.now()
    };
    room.userlocations.set(client.id, updatedCharacterInfo);

    // 충돌 감지 추가
    const collisions = this.collisionDetectionService.detectCollisions(room);
    room.collisions = collisions;
    room.lastCollisionCheckTime = Date.now();
    
    for (let c of room.clients) {
      if (c === client) continue;
      c.emit('theyMove', {
        userPosition: room.userlocations.get(client.id),
        collisions: collisions
      });
    }
  }

  /*
    checkArea 메서드
    O, X 판정을 위한 메서드 
  */
  checkArea(room: Room, client: Socket): number {
    const userLocation = room.userlocations.get(client.id);
    if (!userLocation) return -1; // 유저 위치 정보가 없는 경우

    if (userLocation.position.x < 0) {
      // 0이 O
      return 0;
    } else if (userLocation.position.x > 0) {
      // 1이 X
      return 1;
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
