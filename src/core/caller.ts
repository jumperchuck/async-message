import { Channel } from './channel';
import identity from './identity';

export interface CallerMessage {
  __type: 'caller';
  id: number;
  property: string;
  args: any[];
}

export type GetCallerTarget<T> = T extends (...args: infer A) => infer R
  ? R extends Promise<infer O>
    ? (...args: A) => Promise<O>
    : (...args: A) => Promise<R>
  : T extends Record<string, any>
  ? {
      [key in keyof T]: GetCallerTarget<T[key]>;
    }
  : T extends any
  ? any
  : () => Promise<T>;

export const caller = <T = any>(
  channel: Channel,
  timeout = 1000 * 10,
): GetCallerTarget<T> => {
  const proxies: Record<string, any> = {};

  const createProxy = (property: string): any =>
    new Proxy(
      (...args: any[]) => {
        const id = identity.create();

        return new Promise((resolve, reject) => {
          const msg: CallerMessage = {
            __type: 'caller',
            id,
            property,
            args: args.map((item) => channel.serialize(item, channel)),
          };
          const timer = setTimeout(() => {
            reject(new Error('timeout'));
            channel.removeAllListeners(`resolve-${id}`);
            channel.removeAllListeners(`reject-${id}`);
          }, timeout);
          channel.postMessage(msg);
          channel.on(`resolve-${id}`, (data) => {
            clearTimeout(timer);
            resolve(data);
          });
          channel.on(`reject-${id}`, (err) => {
            clearTimeout(timer);
            reject(err);
          });
        });
      },
      {
        get(target, prop: string) {
          const key = property ? `${property}.${prop}` : prop;
          const proxy = proxies[key] || createProxy(key);
          proxies[key] = proxy;
          return proxy;
        },
      },
    );

  channel.addListener('producer-data', ({ id, data }) => {
    channel.emit(`resolve-${id}`, data);
    channel.removeAllListeners(`resolve-${id}`);
    channel.removeAllListeners(`reject-${id}`);
  });

  channel.removeListener('producer-error', ({ id, error }) => {
    channel.emit(`reject-${id}`, error);
    channel.removeAllListeners(`resolve-${id}`);
    channel.removeAllListeners(`reject-${id}`);
  });

  return createProxy('');
};
