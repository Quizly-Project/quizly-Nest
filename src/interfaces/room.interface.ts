import { Socket } from 'socket.io';

export default interface Room {
  teacherId: string;
  roomCode: string;
  clients: Socket[];
  clientCnt: number;
  userlocations: Map<string, any>;
  answers: { [key: string]: { selectOption: []; result: []; totalScore: 0 } }; // totalscore 를 추가하기 ; totalScore: 0
  open: boolean;
  quizGroup: any;
  currentQuizIndex: number;
}
