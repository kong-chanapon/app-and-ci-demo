// Jest setup file
const { execSync } = require('child_process');

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.APP_VERSION = '1.0.0-test';
process.env.PORT = '3001';

// Global test timeout
jest.setTimeout(10000);