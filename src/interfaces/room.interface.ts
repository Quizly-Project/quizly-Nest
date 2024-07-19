import { Socket } from 'socket.io';
import ModelMapping from './modelMapping.interface';
import CharacterInfo from './characterInfo.interface'
import Collision from './collision.interface';
export default interface Room {
  teacherId: string;
  roomCode: string;
  clients: Socket[];
  clientCnt: number;
  userlocations: Map<string, CharacterInfo>;
  answers: { [key: string]: { selectOption: []; result: [] } };
  open: boolean;
  quizGroup: any;
  quizlength: number;
  currentQuizIndex: number;
  modelList: any[];
  modelMapping: Map<string, ModelMapping>;
  currAnswerList: {};
  intervalId: NodeJS.Timeout;

  // 충돌 감지를 위한 새로운 속성들
  collisions: Collision[]; // 현재 발생한 충돌들의 목록
  collisionGrid?: any; // 충돌 감지를 위한 그리드 구조 (예: UniformGrid3D 인스턴스)
  lastCollisionCheckTime?: number; // 마지막 충돌 검사 시간
  collisionCheckInterval?: number; // 충돌 검사 간격 (밀리초)
}
