import { Injectable } from '@nestjs/common';
@Injectable()
export class MonitorService {
  emitCountReceived = 0;
  emitCountSent = 0;
  totalDataReceived = 0;
  totalDataSent = 0;
  updateStats(data: any, isReceived: boolean) {
    const dataSize = JSON.stringify(data).length;
    if (isReceived) {
      this.emitCountReceived++;
      this.totalDataReceived += dataSize;
    } else {
      this.emitCountSent++;
      this.totalDataSent += dataSize;
    }
  }
  onModuleInit() {
    console.log(`총 수신 emit 횟수: ${this.emitCountReceived}`);
    console.log(`총 수신 데이터 크기: ${this.totalDataReceived} bytes`);
    console.log(`총 발신 emit 횟수: ${this.emitCountSent}`);
    console.log(`총 발신 데이터 크기: ${this.totalDataSent} bytes`);
  }
  //   private stats: Stats;
  //   emitCountReceived = 0;
  //   emitCountSent = 0;
  //   totalDataReceived = 0;
  //   totalDataSent = 0;
  //   constructor() {
  //     this.stats = new Stats();
  //     this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
  //   }
  //   updateStats(data: any, isReceived: boolean) {
  //     const dataSize = JSON.stringify(data).length;
  //     if (isReceived) {
  //       this.emitCountReceived++;
  //       this.totalDataReceived += dataSize;
  //     } else {
  //       this.emitCountSent++;
  //       this.totalDataSent += dataSize;
  //     }
  //     this.stats.update();
  //   }
  //   onModuleInit() {
  //     console.log(`FPS: ${Math.round(this.stats.fps)}`);
  //     console.log(`총 수신 emit 횟수: ${this.emitCountReceived}`);
  //     console.log(`총 수신 데이터 크기: ${this.totalDataReceived} bytes`);
  //     console.log(`총 발신 emit 횟수: ${this.emitCountSent}`);
  //     console.log(`총 발신 데이터 크기: ${this.totalDataSent} bytes`);
  //   }
  //   private emitCountReceived = 0;
  //   private emitCountSent = 0;
  //   private totalDataReceived = 0;
  //   private totalDataSent = 0;
  //   private lastTime = Date.now();
  //   private frameCount = 0;
  //   private fps = 0;
  //   onModuleInit() {
  //     setInterval(() => this.logStats(), 5000); // 5초마다 로그 출력
  //     setInterval(() => this.updateFPS(), 1000); // 1초마다 FPS 업데이트
  //   }
  //   updateStats(data: any, isReceived: boolean) {
  //     const dataSize = JSON.stringify(data).length;
  //     if (isReceived) {
  //       this.emitCountReceived++;
  //       this.totalDataReceived += dataSize;
  //     } else {
  //       this.emitCountSent++;
  //       this.totalDataSent += dataSize;
  //     }
  //     this.frameCount++;
  //   }
  //   private updateFPS() {
  //     const currentTime = Date.now();
  //     const deltaTime = currentTime - this.lastTime;
  //     this.fps = Math.round((this.frameCount * 1000) / deltaTime);
  //     this.frameCount = 0;
  //     this.lastTime = currentTime;
  //   }
  //   private logStats() {
  //     console.log(`FPS: ${this.fps}`);
  //     console.log(`총 수신 emit 횟수: ${this.emitCountReceived}`);
  //     console.log(`총 수신 데이터 크기: ${this.totalDataReceived} bytes`);
  //     console.log(`총 발신 emit 횟수: ${this.emitCountSent}`);
  //     console.log(`총 발신 데이터 크기: ${this.totalDataSent} bytes`);
  //   }
}
