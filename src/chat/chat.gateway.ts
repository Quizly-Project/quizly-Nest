import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import { IsNotEmpty, IsString } from "class-validator";

class ChatMessage {

  @IsNotEmpty()
  @IsString()
  nickname: string;
  
  @IsNotEmpty()
  @IsString()
  message: string;
}

@WebSocketGateway (3002, { cors: { origin: '*' } }) //default는 main의 3000 port
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
  handleNewMessage(@MessageBody() message: String) {
    this.server.emit('message', message);
  }
}

// import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
// import { Socket, Server } from "socket.io";

// @WebSocketGateway(3002, { cors: { origin: '*' } })
// export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
//   @WebSocketServer() server: Server;

//   private userColors: Map<string, string> = new Map();

//   private getColorForNickname(nickname: string): string {
//     if (!this.userColors.has(nickname)) {
//       const color = '#' + Math.floor(Math.random()*16777215).toString(16);
//       this.userColors.set(nickname, color);
//     }
//     return this.userColors.get(nickname);
//   }

//   handleConnection(client: Socket) {
//     console.log('New user connected..', client.id);
//     this.server.emit('user-joined', {
//       message: `New User Joined the Chat: ${client.id}`,
//     });
//   }

//   handleDisconnect(client: Socket) {
//     console.log('user disconnected..', client.id);
//     this.server.emit('user-left', {
//       message: `User Left the Chat: ${client.id} `,
//     });
//   }

//   @SubscribeMessage('setNickname')
//   handleSetNickname(client: Socket, nickname: string) {
//     const color = this.getColorForNickname(nickname);
//     client.emit('nicknameColor', { nickname, color });
//   }

//   @SubscribeMessage('newMessage')
//   handleNewMessage(@MessageBody() data: { nickname: string, message: string }) {
//     const color = this.getColorForNickname(data.nickname);
//     this.server.emit('message', { 
//       nickname: data.nickname, 
//       message: data.message, 
//       color: color 
//     });
//   }
// }