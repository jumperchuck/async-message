import { Emitter } from './emitter';
import { isArray, isObject } from './util';

export interface Message {
  __type: string;
  id: number;
  [key: string]: any;
}

export interface Poster {
  postMessage(message: Message): void;
}

export interface SerializerFallback {
  (value: unknown): void;
}

export interface Serializer {
  // eslint-disable-next-line no-use-before-define
  onRegister(channel: Channel): void;
  // eslint-disable-next-line no-use-before-define
  onUnregister(channel: Channel): void;
  serialize(value: unknown, fallback: SerializerFallback, poster: Poster): any;
  deserialize(value: unknown, fallback: SerializerFallback, poster: Poster): any;
}

const transform = (
  value: unknown,
  handlers: ((val: unknown, fallback: SerializerFallback) => any)[],
): any => {
  let result = value;
  let complete = false;

  handlers.some((fn) => {
    let flag = true;
    const res = fn(result, (val) => {
      flag = false;
      result = val;
    });
    if (flag) {
      result = res;
      complete = flag;
    }
    return flag;
  });

  if (complete) {
    return result;
  }

  if (isArray(result)) {
    return result.map((item) => transform(item, handlers));
  }

  if (isObject(result)) {
    return Object.keys(result).reduce((acc, key) => {
      // @ts-ignore
      acc[key] = transform(result[key], handlers);
      return acc;
    }, {});
  }

  return result;
};

export abstract class Channel extends Emitter implements Poster {
  serializers: Set<Serializer> = new Set();

  abstract postMessage(message: Message): void;

  registerSerializer(serializer: Serializer) {
    this.serializers.add(serializer);
    serializer.onRegister(this);
  }

  unregisterSerializer(serializer: Serializer) {
    this.serializers.delete(serializer);
    serializer.onUnregister(this);
  }

  serialize(value: unknown, poster?: Poster): any {
    if (!this.serializers.size) return value;

    return transform(
      value,
      Array.from(this.serializers).map(
        (item) => (val: unknown, fallback: SerializerFallback) =>
          item.serialize(val, fallback, poster || this),
      ),
    );
  }

  deserialize(value: unknown, poster?: Poster): any {
    if (!this.serializers.size) return value;

    return transform(
      value,
      Array.from(this.serializers).map(
        (item) => (val: unknown, fallback: SerializerFallback) =>
          item.deserialize(val, fallback, poster || this),
      ),
    );
  }
}
