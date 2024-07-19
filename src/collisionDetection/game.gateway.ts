// import {
//   WebSocketGateway,
//   WebSocketServer,
//   SubscribeMessage,
// } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';
// import { GameStateService } from './game-state.service';

// @WebSocketGateway()
// export class GameGateway {
//   @WebSocketServer()
//   server: Server;

//   constructor(private gameStateService: GameStateService) {
//     setInterval(() => this.broadcastState(), 1000 / 30); // 30 FPS
//   }

//   @SubscribeMessage('updatePosition')
//   handleUpdatePosition(
//     client: Socket,
//     payload: { x: number; y: number; z: number }
//   ): void {
//     this.gameStateService.updateCharacter(
//       client.id,
//       payload.x,
//       payload.y,
//       payload.z
//     );
//   }

//   private broadcastState(): void {
//     this.server.emit('gameState', this.gameStateService.getState());
//   }
// }
