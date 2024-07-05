import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import Position from 'src/interfaces/room.interface';
import { RoomService } from 'src/room/room.service';
@Injectable()
export class UserPositionService {
  constructor(private roomService: RoomService) {}
  //유저 좌표
  private userPosition: Map<string, Position> = new Map();

  broadcastNewUserPosition(client: Socket) {
    // 클라이언트의 방 코드를 이용해 방 정보를 가져온다.
    const room = this.roomService.getRoom(client['roomCode']);

    console.log(client['roomCode']);
    // 방에 있는 모든 클라이언트에게 새로운 클라이언트의 위치를 알려준다.
    room.clients.forEach(c => {
      if (c === client) return;
      c.emit('newClientPosition', room.userlocations.get(client.id));
    });
  }

  senAllUserPositions(client: Socket) {
    const room = this.roomService.getRoom(client['roomCode']);
    client.emit('everyonPosition', room.userlocations);
  }

  broadcastUserPosition(client: Socket, data: any) {
    const roomCode = client['roomCode'];
    const room = this.roomService.getRoom(roomCode);
    const { nickName, position } = data;

    room.userlocations.set(client.id, {
      nickName: nickName,
      position: position,
    });
    for (let c of room.clients) {
      if (c === client) continue;
      c.emit('theyMove', room.userlocations.get(client.id));
    }
  }

  /*
    checkArea 메서드
    O, X 판정을 위한 메서드 
  */
  checkArea(room, client): number {
    // TODO: 선생님 위치와 학생 위치를 비교하여 학생이 선생님 영역에 들어왔는지 확인
    //const room = this.rooms[teacher['roomCode']];

    if (room.userlocations[client.id].position.x < 0) {
      // 0이 O
      return 0;
    } else if (room.userlocations[client.id].position.x > 0) {
      // 1이 X
      return 1;
    }
    // TODO: 우선 O, X 판정만 구분
  }
}
