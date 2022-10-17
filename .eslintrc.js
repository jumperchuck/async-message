module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    jest: true,
  },
  extends: ['standard', 'plugin:prettier/recommended'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        sourceType: 'module',
        project: './tsconfig.json',
      },
      extends: ['plugin:@typescript-eslint/recommended'],
      plugins: ['@typescript-eslint/eslint-plugin'],
      rules: {
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    },
  ],
  rules: {
    'no-case-declarations': 'off',
  },
  settings: {},
};
