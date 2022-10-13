const { builtinModules } = require('node:module');
const shell = require('shelljs');
const { resolve } = require('path');
const { build } = require('vite');

shell.rm('-rf', 'dist');
shell.exec('tsc');

Promise.all(
  ['core', 'node', 'serializer', 'web'].map((dir) =>
    build({
      build: {
        target: 'esnext',
        lib: {
          entry: resolve(__dirname, `../src/${dir}`),
          formats: ['cjs', 'es'],
          fileName: (format) => `index.${format}.js`,
        },
        outDir: `dist/${dir}`,
        rollupOptions: {
          external: [...builtinModules, 'async-message'],
        },
        minify: false,
      },
      optimizeDeps: {
        exclude: ['async-message'],
      },
    }),
  ),
).then(() => {
  shell.cp('-r', 'dist/src/*', 'dist');
  shell.rm('-rf', 'dist/{src,tests,index.js,index.d.ts}');
});
