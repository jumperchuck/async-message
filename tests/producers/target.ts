import { Emitter } from 'async-message';

export const target = {
  counter: {
    count: 0,
    getCount() {
      return this.count;
    },
    increment() {
      return ++this.count;
    },
    decrement() {
      return --this.count;
    },
  },
  getter: {},
  caller: {

  },
  emitter: new Emitter(),
};

export type Target = typeof target;
