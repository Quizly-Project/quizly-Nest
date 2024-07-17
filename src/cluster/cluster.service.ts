import { Injectable } from '@nestjs/common';
import * as os from 'os';
import cluster from 'cluster';
import { Worker } from 'cluster';

@Injectable()
export class ClusterService {
  static clusterize(callback: Function): void {
    if (cluster.isPrimary) {
      console.log(`Primary server (${process.pid}) is running`);

      const numCPUs = os.cpus().length;
      for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
      }

      cluster.on('exit', (worker: Worker, code: number, signal: string) => {
        console.log(`Worker ${worker.process.pid} died. Restarting...`);
        cluster.fork();
      });
    } else {
      console.log(`Worker ${process.pid} started`);
      callback();
    }
  }
}
