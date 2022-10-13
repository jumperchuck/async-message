export type Listener = (...args: any[]) => any;

export class Emitter {
  listeners: Record<string, Set<Listener>> = {};

  addListener(type: string, listener: Listener) {
    if (!this.listeners[type]) {
      this.listeners[type] = new Set();
    }
    this.listeners[type].add(listener);
  }

  removeListener(type: string, listener: Listener) {
    const list = this.listeners[type];
    if (list) {
      list.delete(listener);
      if (list.size <= 0) delete this.listeners[type];
    }
  }

  removeAllListeners(type: string) {
    this.listeners[type]?.clear();
    delete this.listeners[type];
  }

  emit(type: string, ...args: any[]) {
    this.listeners[type]?.forEach((listener) => listener(...args));
  }

  on(type: string, listener: Listener) {
    this.addListener(type, listener);
  }

  off(type: string, listener: Listener) {
    this.removeListener(type, listener);
  }

  listenerCount(type: string) {
    return this.listeners[type]?.size || 0;
  }
}

export default new Emitter();
