/**
 * @jest-environment node
 */
import {
  callbackSerializer,
  registerCallback,
  unregisterCallback,
  isRegisterCallback,
  isCallbackMessage,
} from 'async-message/serializer';

describe('callback serializer test', () => {
  it('is register callback', () => {
    expect(isRegisterCallback(registerCallback(jest.fn()))).toBe(true);
    expect(isRegisterCallback(jest.fn())).toBe(false);
    expect(isRegisterCallback(() => 4)).toBe(false);
    expect(isRegisterCallback(null)).toBe(false);
  });

  it('is callback message', () => {
    expect(isCallbackMessage({ __type: 'callback' })).toBe(true);
    expect(isCallbackMessage({ __type: 'callback-register' })).toBe(true);
    expect(isCallbackMessage({ __type: 'callback-unregister' })).toBe(true);
    expect(isCallbackMessage({ __type: 'callback-execute' })).toBe(true);
    expect(isCallbackMessage({ __type: '' })).toBe(false);
    expect(isCallbackMessage(null)).toBe(false);
  });

  it('serialize callback function', () => {
    const callback = jest.fn();
    const fallback = jest.fn();
    const postMessage = jest.fn();
    const poster = { postMessage };
    let result;

    result = callbackSerializer.serialize(callback, fallback, poster);
    expect(result).toStrictEqual({ __type: 'callback' });

    result = callbackSerializer.serialize(registerCallback(callback), fallback, poster);
    expect(result).toStrictEqual({
      __type: 'callback-register',
      id: result.id,
    });

    result = callbackSerializer.serialize(unregisterCallback(callback), fallback, poster);
    expect(result).toStrictEqual({
      __type: 'callback-unregister',
      id: result.id,
    });
  });

  it('serialize no callback function', () => {
    const fallback = jest.fn();
    const postMessage = jest.fn();
    const poster = { postMessage };

    expect(callbackSerializer.serialize(null, fallback, poster)).toBe(undefined);
    expect(callbackSerializer.serialize({}, fallback, poster)).toBe(undefined);
    expect(fallback).toHaveBeenCalled();
  });

  it('deserialize callback function', () => {
    const callback = jest.fn();
    const fallback = jest.fn();
    const postMessage = jest.fn();
    const poster = { postMessage };
    let result;

    result = callbackSerializer.deserialize({ __type: 'callback' }, fallback, poster);
    expect(typeof result).toBe('function');

    result = callbackSerializer.deserialize(
      { __type: 'callback-execute' },
      fallback,
      poster,
    );
    expect(typeof result).toBe('function');

    result = callbackSerializer.deserialize(
      { __type: 'callback-register', id: 1 },
      fallback,
      poster,
    );
    expect(typeof result).toBe('function');

    result = callbackSerializer.deserialize(
      { __type: 'callback-unregister', id: 1 },
      fallback,
      poster,
    );
    expect(typeof result).toBe('function');
  });
});
