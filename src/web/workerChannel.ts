import { Channel, Message, Poster } from 'async-message';

export class WorkerChannel extends Channel {
  private ports: MessagePort[] = [];

  constructor(private worker?: Worker | SharedWorker) {
    super();
    if (worker) {
      this.initInMainThread(worker);
    } else {
      this.initInWorkerThread();
    }
  }

  private initInMainThread(worker: Worker | SharedWorker) {
    const onmessage = (event: MessageEvent) => {
      const { __type } = event.data;
      if (__type) {
        this.emit(__type, event.data);
      }
    };
    if (worker instanceof Worker) {
      worker.addEventListener('message', onmessage);
    } else if (worker instanceof SharedWorker) {
      worker.port.addEventListener('message', onmessage);
      worker.port.start();
    }
  }

  private initInWorkerThread() {
    const onmessage = (event: MessageEvent, poster: Poster) => {
      const { __type } = event.data;
      if (__type) {
        this.emit(__type, event.data, poster);
      }
    };
    /**
     * shared worker
     */
    addEventListener('connect', (event) => {
      const port = (event as MessageEvent).ports[0];
      port.addEventListener('message', (msgEvent) => {
        onmessage(msgEvent, port);
      });
      port.start();
      this.ports.push(port);
    });
    /**
     * worker
     */
    addEventListener('message', (event) => {
      onmessage(event, self);
    });
  }

  private postMessageInMainThread(message: Message, worker: Worker | SharedWorker) {
    if (worker instanceof Worker) {
      worker.postMessage(message);
    } else if (worker instanceof SharedWorker) {
      worker.port.postMessage(message);
    }
  }

  private postMessageInWorkerThread(message: Message, port?: MessagePort) {
    if (port) {
      port.postMessage(message);
    } else if (this.ports.length) {
      this.ports.forEach((port) => port.postMessage(message));
    } else {
      postMessage(message);
    }
  }

  postMessage(message: Message) {
    if (this.worker) {
      this.postMessageInMainThread(message, this.worker);
    } else {
      this.postMessageInWorkerThread(message);
    }
  }
}
