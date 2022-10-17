import { Channel, Message } from 'async-message';
import { ipcMain, ipcRenderer, webContents } from 'electron';

const isMain = process.type === 'browser';
const isRenderer = process.type === 'renderer';

export class IpcChannel extends Channel {
  constructor(private webContent?: Electron.WebContents) {
    super();
    if (isMain) {
      this.initInMainThread();
    } else if (isRenderer) {
      this.initInRenderThread();
    }
  }

  private initInMainThread() {
    ipcMain.on('async-message', (event, message: Message) => {
      const { __type } = message;
      this.emit(__type, message, {
        postMessage: (replyMsg: Message) => {
          event.reply('async-message', replyMsg);
        },
      });
    });
    // ipcMain.handle('async-message', (event, message: Message) => {
    //   const { __type } = message;
    //   return new Promise((resolve) => {
    //     this.emit(__type, message, { postMessage: resolve });
    //   });
    // });
  }

  private initInRenderThread() {
    ipcRenderer.on('async-message', (event, message: Message) => {
      const { __type } = message;
      this.emit(__type, message);
    });
  }

  private postMessageInMainThread(message: Message) {
    if (this.webContent) {
      this.webContent.send('async-message', message);
    } else {
      webContents
        .getAllWebContents()
        .forEach((content) => content.send('async-message', message));
    }
  }

  private postMessageInRenderThread(message: Message) {
    ipcRenderer.send('async-message', message);
    // const data = await ipcRenderer.invoke('async-message', message);
  }

  postMessage(message: Message) {
    if (isMain) {
      this.postMessageInMainThread(message);
    } else if (isRenderer) {
      this.postMessageInRenderThread(message);
    }
  }
}
