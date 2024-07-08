import { Socket } from 'socket.io';

export default interface Room {
  teacherId: string;
  roomCode: string;
  clients: Socket[];
  clientCnt: number;
  userlocations: Map<string, any>;
  answers: { [key: string]: { selectOption: []; result: [] } };
  open: boolean;
  quizGroup: any;
  quizlength: number;
  currentQuizIndex: number;
}
