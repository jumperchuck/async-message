# async-message

> 使用一个统一的API调用其他窗口/线程的方法，像调用一个异步函数一样简单

[![npm version](https://img.shields.io/npm/v/async-message.svg?logo=npm)](https://www.npmjs.com/package/async-message)
[![npm bundle size (minified)](https://img.shields.io/bundlephobia/min/async-message.svg?logo=javascript)](https://www.npmjs.com/package/shuttle-state)

```
# use npm
npm install --save async-message
# use yarn
yarn add async-message
# use pnpm
pnpm install async-message
```

## 特性

- 多平台支持，`web` / `node` / `electron`
- 接口适配，自定义不同场景
- 完美支持`Typescript`
- 自定义序列化/反序列化插件

## 快速开始

### 例子

```tsx
// master.ts
import { caller } from 'async-message';
import { WorkerChannel } from 'async-message/web';
import type { Counter } from './workers/counter';

const worker = new Worker('./workers/counter');
const channel = new WorkerChannel(worker);
const counter = caller<Counter>(channel);

const count = await counter.getCount();
console.log('current cout:', count);

const nextCount = await counter.increment();
console.log('next count:', nextCount);
```

```tsx
// workers/counter.ts
import { producer } from 'async-message';
import { WorkerChannel } from 'async-message/web';

const channel = new WorkerChannel();

const counter = {
  count: 0,
  getCount() {
    return this.count;
  },
  increment() {
    return ++this.count;
  },
  decrement() {
    return --this.count;
  },
}

producer(channel, counter);

export type Counter = typeof counter;
```

在web worker例子中，主线程调用工作线程导出的counter
- `caller`通过`channel`发送消息给worker
- worker里通过`channel`接受到`caller`的消息，并执行counter的方法
- 方法执行结果再通过`channel`发送给`caller`，完成一次调用

### channel

负责`发送消息` / `接受消息` / `广播消息`，`channel`继承`emitter`

### caller(channel, timeout)

负责通过`channel`代理对worker中producer目标的调用，所有方法均返回一个`promise`

### producer(channel, target)

负责通过`channel`导出`target`给其他`caller`调用

## 平台

### Web

```tsx
import { WorkerChannel, WindowChannel } from 'async-message/web';

// for worker 主线程
new WorkerChannel(new Worker('./worker.js'));
// for worker 工作线程
new WorkerChannel();

// for shared worker 主线程
new WorkerChannel(new SharedWorker('./worker.js'));
// for shared worker 工作线程
new WorkerChannel();

// for iframe 父窗口
const iframe = document.querySelector('iframe');
new WindowChannel(iframe.contentWindow, 'https://xxx.xx');
// for iframe 子窗口
new WindowChannel('https://xxx.xx');

// for window 父窗口
const win = window.open('https://xxx.xx');
new WindowChannel(win, 'https://xxx.xx');
// for window 子窗口
new WindowChannel('https://xxx.xx');
```

### Node

```tsx
import { WorkerChannel } from 'async-message/node';
import { Worker } from 'worker_threads';

// for worker 主线程
new WorkerChannel(new Worker('./worker.js'));
// for worker 工作线程
new WorkerChannel();
```

### Electron

```tsx
import { IpcChannel } from 'async-message/electron';

// for main 主线程
new IpcChannel();
// for renderer 渲染线程
new IpcChannel();
```

## 序列化

### 回调函数

数据传递的时候函数无法被序列化，需要一些额外的手段来传递回调函数，通过`callbackSerializer`赋予`channel`序列化/反序列化函数的能力

需要在传递函数的时候注册用`registerCallback`包裹，注销的时候用`unregisterCallback`包裹，否则此函数会常驻于内存

```tsx
// master.ts
import { caller } from 'async-message';
import { WorkerChannel } from 'async-message/web';
import { callbackSerializer, registerCallback, unregisterCallback } from 'async-message/serializer'
import type { Target } from './workers/target';

const worker = new Worker('./workers/target');

const channel = new WorkerChannel(worker);
channel.registerSerializer(callbackSerializer); // 这一步是必须的

const target = caller<Target>(channel);

const callback = () => {};

await target.addEventListener('test', registerCallback(callback));

await target.removeEventListener('test', unregisterCallback(callback));
```

```tsx
// workers/target.ts
import { producer } from 'async-message';
import { WorkerChannel } from 'async-message/web';
import { callbackSerializer } from 'async-message/serializer'

const channel = new WorkerChannel();
channel.registerSerializer(callbackSerializer); // 这一步是必须的

const target = {
  addEventListener(type: string, listener: (...args: any[]) => void) {
    // do something
  },
  removeEventListener(type: string, listener: (...args: any[]) => void) {
    // do something
  }
}

producer(channel, target);

export type Target = typeof counter;
```
> `callbackSerializer`会遍历所有数据字段，如果传递的数据量太大，请自定义serializer

## 高级用法

### 自定义channel

```tsx
import { Channel, Message } from 'async-message';

class MyChannel extends Channel {
  postMessage(message: Message) {
    // do something
  }
}
```

### 自定义serializer

```tsx
import { Serializer, Channel } from 'async-message'

const mySerializer: Serializer = {
  onRegister(channel: Channel) {
    // do something
  },
  onUnregister(channel: Channel) {
    // do something
  },
  serialize(value: unknown, fallback: (value: unknown) => any, poster: Poster) {
    // do something
  },
  deserialize(value: unknown, fallback: (value: unknown) => any, poster: Poster) {
    // do something
  }
}
```
