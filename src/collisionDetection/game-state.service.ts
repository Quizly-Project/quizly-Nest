// import { Injectable } from '@nestjs/common';
// import { Character } from './character.entity'; 
// import { CollisionDetectionService } from './collision-detection.service';

// @Injectable()
// export class GameStateService {
//   private characters: Map<string, Character> = new Map();

//   constructor(private collisionDetectionService: CollisionDetectionService) {}

//   updateCharacter(id: string, x: number, y: number, z: number): void {
//     const character = this.characters.get(id) || new Character(id);
//     character.setPosition(x, y, z);
//     this.characters.set(id, character);
//   }

//   getState(): {
//     characters: Character[];
//     collisions: { id1: string; id2: string }[];
//   } {
//     return {
//       characters: Array.from(this.characters.values()),
//       collisions: this.collisionDetectionService.detectCollisions(
//         this.characters
//       ),
//     };
//   }
// }
