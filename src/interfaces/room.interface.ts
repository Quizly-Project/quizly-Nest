import { Socket } from 'socket.io';

export default interface Room {
  teacherId: string;
  roomCode: string;
  clients: Socket[];
  userlocations: Map<string, any>;
  answers: any[];
  open: boolean;
  quizGroup: any;
  currentQuizIndex: number;
}
