export class Character {
  constructor(
    public id: string,
    public x: number = 0,
    public y: number = 0,
    public z: number = 0
  ) {}

  setPosition(x: number, y: number, z: number): void {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  collidesWith(other: Character): boolean {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const dz = this.z - other.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    return distance < 10; // 충돌 거리를 10으로 가정
  }
}
