import { Emitter } from './emitter';

export interface Message {
  __type: string;
  id: number;
  [key: string]: any;
}

export interface Poster {
  postMessage(message: Message): void;
}

export interface Serializer {
  // eslint-disable-next-line no-use-before-define
  onRegister(channel: Channel): void;
  // eslint-disable-next-line no-use-before-define
  onUnregister(channel: Channel): void;
  serialize(value: unknown, fallback: (value: unknown) => any, poster: Poster): any;
  deserialize(value: unknown, fallback: (value: unknown) => any, poster: Poster): any;
}

export abstract class Channel extends Emitter implements Poster {
  private serializers: Set<Serializer> = new Set();

  abstract postMessage(message: Message): void;

  registerSerializer(serializer: Serializer) {
    this.serializers.add(serializer);
    serializer.onRegister(this);
  }

  unregisterSerializer(serializer: Serializer) {
    this.serializers.delete(serializer);
    serializer.onUnregister(this);
  }

  serialize(value: unknown, poster: Poster) {
    let result = value;
    Array.from(this.serializers).some((item) => {
      let flag = true;
      const fallback = (val: unknown) => {
        flag = false;
        result = val;
      };
      const res = item.serialize(result, fallback, poster);
      if (flag) result = res;
      return flag;
    });
    return result;
  }

  deserialize(value: unknown, poster: Poster) {
    let result = value;
    Array.from(this.serializers).some((item) => {
      let flag = true;
      const fallback = (val: unknown) => {
        flag = false;
        result = val;
      };
      const res = item.deserialize(result, fallback, poster);
      if (flag) result = res;
      return flag;
    });
    return result;
  }
}
