import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { IsNotEmpty, IsString } from 'class-validator';
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { WebsocketExceptionFilter } from './ws-exception.filter';
import { ChatService } from './chat.service';

class ChatMessage {
  @IsNotEmpty()
  @IsString()
  nickName: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsString()
  roomCode: string;
}

@WebSocketGateway(3002, { cors: { origin: '*' } }) //default는 main의 3000 port
@UseFilters(new WebsocketExceptionFilter())
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly chatService: ChatService) {
    this.chatService = chatService;
  }

  @WebSocketServer() server: Server;

  handleConnection(@ConnectedSocket() client: Socket) {
    console.log('New user connected..', client.id);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log('user disconnected..', client.id);
    this.chatService.disconnectChatRoom(client);
  }

  @SubscribeMessage('createChatRoom')
  createRoom(
    @ConnectedSocket() teacher: Socket,
    @MessageBody() data: { roomCode: string; nickName: string }
  ) {
    const { roomCode, nickName } = data;
    teacher['roomCode'] = roomCode;
    teacher['nickName'] = nickName;

    let result = this.chatService.createChatRoom(teacher, roomCode);

    if (result === undefined) {
      teacher['roomCode'] = undefined;
      teacher['nickName'] = undefined;
    } else {
      console.log('채팅방 생성됨 : ', result);
    }
  }

  @SubscribeMessage('joinChatRoom')
  joinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomCode: string; nickName: string }
  ) {
    const { roomCode, nickName } = data;
    client['roomCode'] = roomCode;
    client['nickName'] = nickName;
    this.chatService.joinChatRoom(client, roomCode, nickName);
  }

  @SubscribeMessage('newMessage')
  @UsePipes(new ValidationPipe())
  handleNewMessage(
    @MessageBody() message: ChatMessage,
    @ConnectedSocket() client: Socket
  ) {
    this.chatService.messageBroadcast(
      message.roomCode,
      message.nickName,
      message.message,
      client
    );
  }
}
