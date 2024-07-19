import Position from "./Position.interface";

export default interface CharacterInfo {
  nickName: string;
  position: Position;
  radius: number; // 캐릭터의 충돌 반경
  lastCollisionTime?: number; // 마지막 충돌 시간 (필요한 경우)
}
