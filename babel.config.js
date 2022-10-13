module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        loose: true,
        modules: 'commonjs',
        targets: { node: 'current' },
      },
    ],
  ],
  plugins: ['@babel/plugin-transform-typescript'],
};
