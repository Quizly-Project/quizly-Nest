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
}
