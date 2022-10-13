import { Channel } from './channel';

export interface ProducerMessage {
  __type: 'producer-data' | 'producer-error';
  id: number;
  data?: any;
  error?: any;
}

const getValue = (obj: any, path: unknown) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  if (typeof path === 'number') {
    return obj[path];
  }
  if (typeof path === 'string') {
    if (Object.prototype.hasOwnProperty.call(obj, path)) {
      return obj[path];
    }
    return path.split('.').reduce((acc, item) => (acc ? acc[item] : undefined), obj);
  }
  if (Array.isArray(path)) {
    return path.reduce((acc, item) => (acc ? acc[item] : undefined), obj);
  }
  return undefined;
};

export const producer = <T>(channel: Channel, target: T) => {
  channel.addListener('caller', async (message, poster) => {
    const { id, property, args } = message;
    try {
      const value = getValue(target, property);
      if (typeof value === 'function') {
        const receiver =
          getValue(target, property.split('.').slice(0, -1).pop()) || target;
        const data = await value.apply(
          receiver,
          args.map((item: any) => channel.deserialize(item, poster || channel)),
        );
        const msg: ProducerMessage = {
          __type: 'producer-data',
          id,
          data,
        };
        poster?.postMessage?.(msg) || channel.postMessage(msg);
      } else {
        const msg: ProducerMessage = {
          __type: 'producer-data',
          id,
          data: value,
        };
        poster?.postMessage?.(msg) || channel.postMessage(msg);
      }
    } catch (error) {
      const msg: ProducerMessage = {
        __type: 'producer-error',
        id,
        error,
      };
      poster?.postMessage?.(msg) || channel.postMessage(msg);
    }
  });

  return target;
};
