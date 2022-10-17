const { builtinModules } = require('node:module');
const { resolve } = require('path');
const { build } = require('vite');

function buildJS(entry) {
  const dir = entry.split('/');
  const file = dir.pop();
  const prefix = file.split('.').slice(0, -1);
  return build({
    resolve: {
      alias: {
        'async-message': resolve(__dirname, '../src'),
      },
    },
    build: {
      target: 'esnext',
      lib: {
        entry,
        formats: ['cjs'],
        fileName: prefix.join('.'),
      },
      outDir: dir.join('/'),
      rollupOptions: {
        external: [...builtinModules],
      },
      minify: false,
      emptyOutDir: false,
    },
  });
}

buildJS('tests/producers/producer.node.worker.ts');
buildJS('tests/producers/producer.web.window.ts');
buildJS('tests/producers/producer.web.worker.ts');
