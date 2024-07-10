import { Socket } from 'socket.io';

export default interface ChatRoom {
  teacherId: string;
  roomCode: string;
  clients: Socket[];
}
