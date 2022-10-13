/**
 * @jest-environment jsdom
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { WindowChannel, WorkerChannel } from 'async-message/web';
import { targetTest } from './case';
import { createServer } from './server';

describe('async message for web test', () => {
  const code = readFileSync(
    resolve(__dirname, './producers/producer.web.worker.js'),
    'utf-8',
  );
  const worker = new Worker(URL.createObjectURL(new Blob([code])));
  const channel = new WorkerChannel(worker);

  it('main thread call worker thread', async () => {
    await targetTest(channel);
  });
});

describe('async message for iframe test', () => {
  const html = readFileSync(resolve(__dirname, './iframe/parent.html'), 'utf-8');

  const waitIFrameComplete = () => {
    const iframe = document.querySelector('iframe');
    return new Promise((resolve) => {
      const load = () => {
        const { readyState } = iframe!.contentDocument!;
        if (readyState === 'complete') {
          resolve(readyState);
        } else {
          setTimeout(load, 100);
        }
      };

      load();
    });
  };

  beforeEach(async () => {
    createServer(80);
    document.body.innerHTML = html;
    await waitIFrameComplete();
  });

  it('test', async () => {
    const iframe = document.querySelector('iframe');
    const channel = new WindowChannel(iframe!.contentWindow!, '*');

    expect(iframe).toBeTruthy();

    await targetTest(channel);
  });
});
