/**
 * @jest-environment node
 */
import { resolve } from 'path';
import { Worker } from 'worker_threads';
import { WorkerChannel } from 'async-message/node';
import { targetTest } from './case';

describe('for worker threads', () => {
  const worker = new Worker(resolve(__dirname, './producers/producer.node.worker.js'));
  const channel = new WorkerChannel(worker);

  targetTest(() => channel);
});
