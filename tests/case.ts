import { caller, Channel } from 'async-message';
import { callbackSerializer, registerCallback } from 'async-message/serializer';
import { Target } from './producers/target';

export const targetTest = async (channel: Channel) => {
  const target = caller<Target>(channel);

  expect(await target.counter.getCount()).toBe(0);
  expect(await target.counter.increment()).toBe(1);
  expect(await target.counter.decrement()).toBe(0);

  // channel.registerSerializer(callbackSerializer);
  // const fn = jest.fn();
  // await target.emitter.on('test', registerCallback(fn));
  // await target.emitter.emit('test', 1);
  // expect(fn).toHaveBeenCalled();
};
