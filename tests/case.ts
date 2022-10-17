import { caller, Channel } from 'async-message';
import {callbackSerializer, registerCallback, unregisterCallback} from 'async-message/serializer';
import { Target } from './producers/target';

export const targetTest = (getChannel: () => Channel) => {
  it('call exist attributes', async () => {
    const channel = getChannel();
    const target = caller<Target>(channel);

    await expect(target.counter.count()).resolves.toBe(0);
    await expect(target.counter.getCount()).resolves.toBe(0);
    await expect(target.counter.increment()).resolves.toBe(1);
    await expect(target.counter.decrement()).resolves.toBe(0);
  });

  it('call not exist attributes', async () => {
    const channel = getChannel();
    const target = caller<Target>(channel);

    // @ts-ignore
    await expect(target.counter.nothing()).resolves.toBeUndefined();
  });

  it('callback serializer', async () => {
    const channel = getChannel();
    const target = caller<Target>(channel);
    channel.registerSerializer(callbackSerializer);

    const fn = jest.fn();
    await target.emitter.on('test', registerCallback(fn));
    await target.emitter.emit('test', 1, 2, 3);
    expect(fn).toBeCalledTimes(1);
    expect(fn).toBeCalledWith(1, 2, 3);

    await target.emitter.off('test', unregisterCallback(fn));
    await target.emitter.emit('test', 2);
    expect(fn).toBeCalledTimes(1);
  });

  it('operation timed out', async () => {
    const channel = new (class extends Channel {
      postMessage() {
        console.log('post');
      }
    })();
    const target = caller(channel, 2000);

    await expect(target.nothing()).rejects.toThrow('timeout');
  });
};
