import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
//
import {IoAdapter} from '@nestjs/platform-socket.io';
import {RoomService} from './room/room.service';
import { Socket } from 'socket.io';
import { HttpAdapterHost } from '@nestjs/core';
//

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //
  const roomService = app.get(RoomService);
  const httpAdapterHost = app.get(HttpAdapterHost);
  const httpServer = httpAdapterHost.httpAdapter.getHttpServer();
  const io = require('socket.io')(httpServer);

  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    socket.on('joinRoom', (data: any) => {
      roomService.joinRoom
      
      (socket, data);
    });

    socket.on('submitAnswer', (answer: any) => {
      roomService.submitAnswer(socket, answer);
    });

    socket.on('disconnect', () => {
      roomService.handleDisconnect(socket);
    });
  });

  app.useWebSocketAdapter(new IoAdapter(app));
  //

  await app.listen(3000);
}
bootstrap();
