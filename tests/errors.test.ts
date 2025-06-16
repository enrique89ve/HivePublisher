/**
 * Tests for HiveError class and error handling
 */

import { HiveError, ERROR_CODES } from '../src/types';

describe('HiveError', () => {
  test('should create error with code and message', () => {
    const error = new HiveError('TEST_ERROR', 'Test message');
    
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('HiveError');
    expect(error.code).toBe('TEST_ERROR');
    expect(error.message).toBe('Test message');
    expect(error.context).toBeUndefined();
    expect(error.cause).toBeUndefined();
  });

  test('should create error with context', () => {
    const context = { username: 'alice', attempt: 1 };
    const error = new HiveError('NETWORK_ERROR', 'Connection failed', context);
    
    expect(error.code).toBe('NETWORK_ERROR');
    expect(error.message).toBe('Connection failed');
    expect(error.context).toEqual(context);
  });

  test('should create error with cause', () => {
    const originalError = new Error('Original error');
    const error = new HiveError('WRAPPED_ERROR', 'Wrapped message', undefined, originalError);
    
    expect(error.cause).toBe(originalError);
  });

  test('should have proper stack trace', () => {
    const error = new HiveError('STACK_TEST', 'Stack test');
    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('HiveError');
  });
});

describe('ERROR_CODES', () => {
  test('should contain all expected error codes', () => {
    expect(ERROR_CODES.INVALID_CREDENTIALS).toBe('INVALID_CREDENTIALS');
    expect(ERROR_CODES.MISSING_POSTING_KEY).toBe('MISSING_POSTING_KEY');
    expect(ERROR_CODES.INVALID_USERNAME).toBe('INVALID_USERNAME');
    expect(ERROR_CODES.NETWORK_ERROR).toBe('NETWORK_ERROR');
    expect(ERROR_CODES.TRANSACTION_FAILED).toBe('TRANSACTION_FAILED');
  });

  test('should be readonly', () => {
    // This should fail if ERROR_CODES is mutable
    expect(() => {
      (ERROR_CODES as any).NEW_ERROR = 'NEW_ERROR';
    }).toThrow();
  });
});
