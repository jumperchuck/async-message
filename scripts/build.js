const { builtinModules } = require('node:module');
const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const { build } = require('vite');

function buildJS(entry, outDir) {
  return build({
    build: {
      target: 'esnext',
      lib: {
        entry,
        formats: ['cjs', 'es'],
        fileName: (format) => `index${format === 'cjs' ? '' : `.${format}`}.js`,
      },
      outDir,
      rollupOptions: {
        external: [...builtinModules, 'async-message'],
      },
      minify: false,
    },
    optimizeDeps: {
      exclude: ['async-message'],
    },
  });
}

(async () => {
  shell.rm('-rf', 'dist');
  shell.exec('tsc');
  shell.rm('-rf', 'dist/src/**/*.js');

  await Promise.all([
    buildJS('src/core', 'dist/core'),
    buildJS('src/node', 'dist/node'),
    buildJS('src/serializer', 'dist/serializer'),
    buildJS('src/web', 'dist/web'),
  ]);

  shell.cp('-r', 'dist/src/*', 'dist');
  shell.rm('-rf', 'dist/{src,tests,index.d.ts}');
  shell.cp('package.json', 'LICENSE', 'README.md', 'dist');

  const pkg = require('../dist/package.json');
  delete pkg.private;
  delete pkg.scripts;
  delete pkg.devDependencies;
  delete pkg['lint-staged'];
  fs.writeFileSync(
    path.resolve(__dirname, '../dist/package.json'),
    JSON.stringify(pkg, null, '  '),
  );
})();
