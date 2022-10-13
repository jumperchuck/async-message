module.exports = {
  rootDir: '.',
  setupFiles: ['jsdom-worker', './tests/setup.ts'],
  moduleNameMapper: {
    '^async-message$': '<rootDir>/src',
    '^async-message/web$': '<rootDir>/src/web',
  },
  modulePathIgnorePatterns: ['dist'],
  transformIgnorePatterns: [],
  testRegex: 'test.(js|ts|tsx)$',
  coverageDirectory: './coverage/',
  coverageReporters: ['json', 'html', 'text', 'text-summary'],
  collectCoverageFrom: ['src/**/*.{js,ts}', 'tests/**/*.{js,ts}'],
  testEnvironmentOptions: {
    resources: 'usable',
  },
};
