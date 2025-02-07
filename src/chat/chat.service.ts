import { Injectable } from '@nestjs/common';
import ChatRoom from './chatRoom.interface';
import { Socket } from 'socket.io';

@Injectable()
export class ChatService {
  private chatRooms: Map<string, ChatRoom> = new Map();

  /*
    createChatRoom 메서드
    채팅방을 생성하는 메서드 
  */
  createChatRoom(teacher: Socket, roomCode: string) {
    if (this.chatRooms.has(roomCode)) {
      console.log('이미 생성된 채팅방입니다.');
      return;
    }

    const chatRoom: ChatRoom = {
      teacherId: teacher.id,
      roomCode: roomCode,
      clients: [],
    };
    chatRoom.clients.push(teacher);
    this.chatRooms.set(roomCode, chatRoom);

    return chatRoom;
  }

  /*
    joinChatRoom 메서드
    채팅방에 참가하는 메서드 
  */
  joinChatRoom(client: Socket, roomCode: string, nickName: string) {
    const chatRoom = this.chatRooms.get(roomCode);
    if (!chatRoom) {
      client.disconnect();
      console.log('존재하지 않는 채팅방입니다.');
      return;
    }

    let isAlreadyConnected = chatRoom.clients.some(c => c.id === client.id);

    if (isAlreadyConnected) {
      console.log('이미 접속한 사용자입니다.');
      return;
    }
    chatRoom.clients.push(client);

    for (let c of chatRoom.clients) {
      if (c === client) continue;
      c.emit('user-joined', {
        message: `${nickName}님이 채팅방에 참가하였습니다.`,
      });
    }
  }

  /*
    getChatRoom 메서드
    채팅방을 가져오는 메서드 
  */
  getChatRoom(roomCode: string): ChatRoom {
    return this.chatRooms.get(roomCode);
  }

  /*
    messageBroadcast 메서드
    채팅방에 있는 모든 클라이언트에게 메시지를 전달하는 메서드
  */
  messageBroadcast(
    roomCode: string,
    nickName: string,
    message: string,
    client: Socket
  ) {
    const chatRoom = this.chatRooms.get('991056');

    if (!chatRoom) {
      console.log('채팅방이 존재하지 않습니다.');
      return;
    }

    for (let c of chatRoom.clients) {
      c.emit('newMessage', { nickName: nickName, message: message });
    }
  }

  /*
    disconnectChatRoom 메서드
    채팅방을 나가는 메서드
  */
  disconnectChatRoom(client: Socket) {
    const chatRoom: ChatRoom = this.chatRooms.get(client['roomCode']);
    if (!chatRoom) {
      console.log('채팅방이 존재하지 않습니다.');
      return;
    }

    if (chatRoom.teacherId === client.id) {
      chatRoom.clients.forEach(c => c.disconnect());
      this.chatRooms.delete(client['roomCode']);
      chatRoom.clients = [];
    } else {
      chatRoom.clients = chatRoom.clients.filter(c => c !== client);
      client['roomCode'] = undefined;

      for (let c of chatRoom.clients) {
        if (c === client) continue;
        c.emit('user-left', {
          message: `${client['nickName']}님이 채팅방을 나갔습니다.`,
        });
      }
    }
  }
}
