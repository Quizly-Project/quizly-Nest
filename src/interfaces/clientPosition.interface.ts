import { Socket } from 'socket.io';

export default interface clientPosition {
  client: Socket;
  nickName: string;
  x: number;
  y: number;
  z: number;
  radius: number;
}
