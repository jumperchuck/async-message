import { Channel } from './channel';
import { getValue } from './util';

export interface ProducerMessage {
  __type: 'producer-data' | 'producer-error';
  id: number;
  data?: any;
  error?: any;
}

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
          args.map((item: any) => channel.deserialize(item, poster)),
        );
        const msg: ProducerMessage = {
          __type: 'producer-data',
          id,
          data: channel.serialize(data, poster),
        };
        poster?.postMessage?.(msg) || channel.postMessage(msg);
      } else {
        const msg: ProducerMessage = {
          __type: 'producer-data',
          id,
          data: channel.serialize(value, poster),
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
