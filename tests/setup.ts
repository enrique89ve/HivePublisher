/**
 * Jest setup file for HiveTS tests
 * This file runs before all test files
 */

// Extend jest matchers
expect.extend({
  toBeValidHiveUsername(received: string) {
    const pass = /^[a-z0-9.-]{3,16}$/.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid Hive username`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid Hive username`,
        pass: false,
      };
    }
  },
  
  toBeValidPermlink(received: string) {
    const pass = /^[a-z0-9-]{1,256}$/.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid permlink`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid permlink`,
        pass: false,
      };
    }
  },
});

// Declare custom matchers for TypeScript
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidHiveUsername(): R;
      toBeValidPermlink(): R;
    }
  }
}

// Set up test environment
process.env.NODE_ENV = 'test';

// Mock console methods in tests (can be overridden per test)
global.console = {
  ...console,
  // Uncomment to suppress console logs in tests
  // log: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};
