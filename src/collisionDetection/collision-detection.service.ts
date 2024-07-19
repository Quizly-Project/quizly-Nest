import { Injectable } from '@nestjs/common';
import { Character } from './character.entity'; 
import { UniformGrid3D } from './uniform-grid-3d.util';
import Room from 'src/interfaces/room.interface';
import Collision from 'src/interfaces/collision.interface';

@Injectable()
export class CollisionDetectionService {
  private grid: UniformGrid3D;

  constructor() {
    this.grid = new UniformGrid3D(50); // 셀 크기를 50으로 설정
  }

  detectCollisions(room: Room): Collision[] {
    const collisions: Collision[] = [];
    this.grid.clear();

    // 그리드에 캐릭터 삽입
    for (const [id, data] of room.userlocations.entries()) {
      const { position } = data;
      this.grid.insert(id, position.x, position.y, position.z);
    }

    // 충돌 검사
    for (const [id, data] of room.userlocations.entries()) {
      const { position } = data;
      const nearby = this.grid.getNearby(position.x, position.y, position.z);
      for (const otherId of nearby) {
        if (id !== otherId) {
          const otherPosition = room.userlocations.get(otherId).position;
           if (this.isColliding(position, otherPosition)) {
             collisions.push({
               id1: id,
               id2: otherId,
               time: Date.now(),
             });
           }
        }
      }
    }

    return collisions;
  }

  private isColliding(
    pos1: { x: number; y: number; z: number },
    pos2: { x: number; y: number; z: number }
  ): boolean {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = pos1.z - pos2.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    return distance < 10; // 충돌 거리를 10으로 설정
  }
}
