/**
 * Simple test to verify getSlug functionality
 */

import { generatePermlink } from '../src/utils';

describe('generatePermlink', () => {
  it('should generate a permlink from title', () => {
    const result = generatePermlink('Hello World');
    expect(typeof result).toBe('string');
    expect(result).toMatch(/^[a-z0-9-]+$/);
  });

  it('should handle empty title', () => {
    const result = generatePermlink('');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});
