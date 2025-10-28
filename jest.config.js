module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.js'],
  collectCoverageFrom: [
    'server.js',
    '!node_modules/**',
    '!test/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/test/setup.js']
};