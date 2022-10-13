const { builtinModules } = require('node:module');
const { resolve } = require('path');
const { build } = require('vite');

[
  'producers/producer.web.iframe.ts',
  'producers/producer.web.worker.ts',
  'producers/producer.node.worker.ts',
].forEach((path) => {
  const dir = path.split('/');
  const file = dir.pop();
  const prefix = file.split('.').slice(0, -1);
  build({
    resolve: {
      alias: {
        'async-message': resolve(__dirname, '../src'),
      },
    },
    build: {
      target: 'esnext',
      lib: {
        entry: resolve(__dirname, `../tests/${path}`),
        formats: ['cjs'],
        fileName: prefix.join('.'),
      },
      outDir: resolve(__dirname, `../tests/${dir.join('/')}`),
      rollupOptions: {
        external: [...builtinModules],
      },
      minify: false,
      emptyOutDir: false,
    },
  });
});
