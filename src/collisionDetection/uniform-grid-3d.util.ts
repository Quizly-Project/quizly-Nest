export class UniformGrid3D {
  private cells: Map<string, Set<string>> = new Map();

  constructor(private cellSize: number) {}

  private getCellKey(x: number, y: number, z: number): string {
    return `${Math.floor(x / this.cellSize)},${Math.floor(y / this.cellSize)},${Math.floor(z / this.cellSize)}`;
  }

  insert(id: string, x: number, y: number, z: number): void {
    const key = this.getCellKey(x, y, z);
    if (!this.cells.has(key)) {
      this.cells.set(key, new Set());
    }
    this.cells.get(key).add(id);
  }

  getNearby(x: number, y: number, z: number): string[] {
    const key = this.getCellKey(x, y, z);
    return Array.from(this.cells.get(key) || []);
  }

  clear(): void {
    this.cells.clear();
  }
}
