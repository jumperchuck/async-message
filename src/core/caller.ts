import { Channel } from './channel';
import identity from './identity';

export interface CallerMessage {
  __type: 'caller';
  id: number;
  property: string;
  args: any[];
}

export type GetCallerTarget<T> = 0 extends 1 & T
  ? any
  : T extends (...args: infer A) => infer R
  ? R extends Promise<infer O>
    ? (...args: A) => Promise<O>
    : (...args: A) => Promise<R>
  : T extends Record<string, any>
  ? (() => Promise<T>) & {
      [key in keyof T]: GetCallerTarget<T[key]>;
    }
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
            args: args.map((item) => channel.serialize(item)),
          };
          const timer = setTimeout(() => {
            reject(new Error(`async-message call ${property} timeout`));
            channel.removeAllListeners(`resolve-${id}`);
            channel.removeAllListeners(`reject-${id}`);
          }, timeout);
          channel.on(`resolve-${id}`, (data) => {
            clearTimeout(timer);
            resolve(data);
          });
          channel.on(`reject-${id}`, (err) => {
            clearTimeout(timer);
            reject(err);
          });
          channel.postMessage(msg);
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
    channel.emit(`resolve-${id}`, channel.deserialize(data));
    channel.removeAllListeners(`resolve-${id}`);
    channel.removeAllListeners(`reject-${id}`);
  });

  channel.addListener('producer-error', ({ id, error }) => {
    channel.emit(`reject-${id}`, error);
    channel.removeAllListeners(`resolve-${id}`);
    channel.removeAllListeners(`reject-${id}`);
  });

  return createProxy('');
};
