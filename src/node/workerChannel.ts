import { Channel, Message } from 'async-message';
import { Worker, parentPort } from 'worker_threads';

export class WorkerChannel extends Channel {
  constructor(private worker?: Worker) {
    super();
    if (worker) {
      this.initInMainThread(worker);
    } else {
      this.initInWorkerThread();
    }
  }

  private initInMainThread(worker: Worker) {
    worker.on('message', (message: Message) => {
      const { __type } = message;
      if (__type) {
        this.emit(__type, message);
      }
    });
  }

  private initInWorkerThread() {
    parentPort?.on('message', (message: Message) => {
      const { __type } = message;
      if (__type) {
        this.emit(__type, message);
      }
    });
  }

  private postMessageInMainThread(message: Message, worker: Worker) {
    worker.postMessage(message);
  }

  private postMessageInWorkerThread(message: Message) {
    parentPort?.postMessage(message);
  }

  postMessage(message: Message) {
    if (this.worker) {
      this.postMessageInMainThread(message, this.worker);
    } else {
      this.postMessageInWorkerThread(message);
    }
  }
}
