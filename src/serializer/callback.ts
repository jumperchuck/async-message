import { Serializer, Channel, Identity, Emitter, Message, Poster } from 'async-message';

export type CallbackMessageType =
  | 'callback'
  | 'callback-register'
  | 'callback-unregister'
  | 'callback-execute';

export interface CallbackMessage {
  __type: CallbackMessageType;
  id: number;
  args: any[];
}

export interface RegisterCallback {
  (...args: any[]): any;
  __type: CallbackMessageType;
  id: number;
  originalFn: (...args: any[]) => any;
}

const types: CallbackMessageType[] = [
  'callback',
  'callback-register',
  'callback-unregister',
  'callback-execute',
];

const identity = new Identity();

const emitter = new Emitter();

const callbacks: RegisterCallback[] = [];

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

const execute = (message: Message) => {
  const { __type, id, args } = message;
  if (__type === 'callback-execute') {
    emitter.emit(`callback-${id}`, ...args);
  }
};

export const registerCallback = (fn: (...args: any[]) => any) => {
  const id = identity.create();
  const register: RegisterCallback = (...args) => fn(...args);
  register.__type = 'callback-register';
  register.originalFn = fn;
  register.id = id;
  callbacks.push(register);
  emitter.on(`callback-${register.id}`, register.originalFn);
  return register;
};

export const unregisterCallback = (fn: (...args: any[]) => any) => {
  const index = callbacks.findIndex((item) => item.originalFn === fn);
  const register = index > -1 ? callbacks[index] : null;
  if (register) {
    callbacks.splice(index, 1);
    emitter.off(`callback-${register.id}`, register.originalFn);
    register.__type = 'callback-unregister';
    return register;
  }
  return fn;
};

export const isRegisterCallback = (value: unknown): value is RegisterCallback => {
  return typeof value === 'function' && types.includes(Reflect.get(value, '__type'));
};

export const isCallbackMessage = (value: unknown): value is CallbackMessage => {
  return (
    typeof value === 'object' &&
    value !== null &&
    types.includes(Reflect.get(value, '__type'))
  );
};

export const callbackSerializer: Serializer = {
  onRegister(channel: Channel) {
    channel.addListener('callback-execute', execute);
  },

  onUnregister(channel: Channel) {
    channel.removeListener('callback-execute', execute);
  },

  deserialize(value: unknown, fallback: (value: unknown) => any, poster: Poster): any {
    if (isCallbackMessage(value)) {
      const { __type, id } = value;
      switch (__type) {
        case 'callback-register':
          const callback = (...args: any[]) => {
            const message: CallbackMessage = {
              __type: 'callback-execute',
              id,
              args,
            };
            poster.postMessage(message);
          };
          registerCallback(callback);
          return callback;
        case 'callback-unregister':
          const register = callbacks.find((item) => item.id === id);
          if (register) {
            unregisterCallback(register.originalFn);
            return register.originalFn;
          }
          return noop;
        case 'callback-execute':
        case 'callback':
          return noop;
      }
    }
    fallback(value);
  },

  serialize(value: unknown, fallback: (value: unknown) => any) {
    if (isRegisterCallback(value)) {
      const { __type, id } = value;
      return { __type, id };
    }
    if (typeof value === 'function') {
      return {
        __type: 'callback',
      };
    }
    fallback(value);
  },
};
