import { Socket } from 'socket.io';

export default interface Room {
  teacherId: string;
  roomCode: string;
  clients: Socket[];
  userlocations: Map<string, Location>;
  answers: any[];
  open: boolean;
  quizGroup: any;
}
