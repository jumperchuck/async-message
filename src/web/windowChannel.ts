import { Channel, Message } from 'async-message';

export class WindowChannel extends Channel {
  private win?: Window;
  private targetOrigin: string;

  constructor(targetOrigin?: string);
  constructor(win: Window, targetOrigin: string);
  constructor(winOrTargetOrigin?: Window | string, targetOrigin = location.origin) {
    super();
    this.win = typeof winOrTargetOrigin === 'object' ? winOrTargetOrigin : undefined;
    this.targetOrigin =
      typeof winOrTargetOrigin === 'string' ? winOrTargetOrigin : targetOrigin;
    this.init();
  }

  private init() {
    window.addEventListener('message', (event: MessageEvent) => {
      const { __type } = event.data;
      if (__type) {
        this.emit(__type, event.data);
      }
    });
  }

  private postMessageInParentThread(message: Message, win: Window) {
    win.postMessage(message, this.targetOrigin);
  }

  private postMessageInChildThread(message: Message) {
    window.parent.postMessage(message, this.targetOrigin);
  }

  postMessage(message: Message) {
    if (this.win) {
      this.postMessageInParentThread(message, this.win);
    } else {
      this.postMessageInChildThread(message);
    }
  }
}
