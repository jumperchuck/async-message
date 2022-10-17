/**
 * @jest-environment jsdom
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { WindowChannel, WorkerChannel } from 'async-message/web';
import { targetTest } from './case';
import { createServer } from './server';

describe('for web worker', () => {
  const code = readFileSync(
    resolve(__dirname, './producers/producer.web.worker.js'),
    'utf-8',
  );
  const worker = new Worker(URL.createObjectURL(new Blob([code])));
  const channel = new WorkerChannel(worker);

  targetTest(() => channel);
});

describe('for iframe window', () => {
  const html = `
<!doctype html>
<html>
<body>
  <iframe src="http://localhost/tests/child.html"></iframe>
</body>
<script>
  window.childWindow = window.open('http://localhost/tests/child.html');
</script>
</html>`;

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

  let channel: WindowChannel;

  beforeAll(async () => {
    createServer(80);
    document.body.innerHTML = html;
    await waitIFrameComplete();
    const iframe = document.querySelector('iframe');
    channel = new WindowChannel(iframe!.contentWindow!, '*');
  });

  targetTest(() => channel);
});

// TODO: jest不支持window.open，考虑使用webdriver?
// describe('for open window', () => {
//   let channel: WindowChannel;
//
//   beforeAll(async () => {
//     const child = window.open('http://localhost/tests/child.html');
//     channel = new WindowChannel(child, '*');
//   });
//
//   targetTest(() => channel);
// });
