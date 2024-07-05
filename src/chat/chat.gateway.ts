import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import { IsNotEmpty, IsString } from "class-validator";
import { UseFilters, UsePipes, ValidationPipe } from "@nestjs/common";
import { WebsocketExceptionFilter } from "./ws-exception.filter";

class ChatMessage {

  @IsNotEmpty()
  @IsString()
  nickname: string;
  
  @IsNotEmpty()
  @IsString()
  message: string;
}

@WebSocketGateway (3002, { cors: { origin: '*' } }) //default는 main의 3000 port
@UseFilters(new WebsocketExceptionFilter())
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  handleConnection(client: any) {
    console.log('New user connected..', client.id);

    client.broadcast.emit('user-joined', {
      message: `New User Joined the Chat: ${client.id}`,
    });    
  }

  handleDisconnect(client: any) {
    console.log('user disconnected..', client.id);

    this.server.emit('user-left', {
      message: `User Left the Chat: ${client.id} `,
    });
  }

  @SubscribeMessage('newMessage')
  @UsePipes (new ValidationPipe())
  handleNewMessage(@MessageBody() message: ChatMessage) {
    this.server.emit('message', {
      ...message,
      time: new Date().toDateString(),
    });
  }
}