import { Socket } from 'socket.io';
import ModelMapping from './modelMapping.interface';

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
  modelList: any[];
  modelMapping: Map<string, ModelMapping>;
}
