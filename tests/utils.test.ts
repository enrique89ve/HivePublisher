/**
 * Tests for utility functions
 */

import { validateUsername, validateTags, generatePermlink } from '../src/utils';

describe('Utils', () => {
  describe('validateUsername', () => {
    test('should validate correct usernames', () => {
      expect(validateUsername('alice')).toBe(true);
      expect(validateUsername('bob123')).toBe(true);
      expect(validateUsername('user-name')).toBe(true);
      expect(validateUsername('user.name')).toBe(true);
      expect(validateUsername('a')).toBe(false); // Too short
    });

    test('should reject invalid usernames', () => {
      expect(validateUsername('')).toBe(false);
      expect(validateUsername('ab')).toBe(false); // Too short
      expect(validateUsername('a'.repeat(17))).toBe(false); // Too long
      expect(validateUsername('User')).toBe(false); // Uppercase
      expect(validateUsername('user@')).toBe(false); // Invalid character
      expect(validateUsername('-user')).toBe(false); // Starts with hyphen
      expect(validateUsername('user-')).toBe(false); // Ends with hyphen
      expect(validateUsername('user--name')).toBe(false); // Double hyphen
    });
  });

  describe('validateTags', () => {
    test('should validate correct tags', () => {
      expect(validateTags(['tag1'])).toBe(true);
      expect(validateTags(['tag1', 'tag2'])).toBe(true);
      expect(validateTags(['hive', 'blockchain', 'crypto'])).toBe(true);
    });

    test('should reject invalid tags', () => {
      expect(validateTags([])).toBe(false); // Empty array
      expect(validateTags(['a'])).toBe(false); // Too short
      expect(validateTags(['a'.repeat(25)])).toBe(false); // Too long
      expect(validateTags(Array(6).fill('tag'))).toBe(false); // Too many tags
      expect(validateTags(['Tag'])).toBe(false); // Uppercase
      expect(validateTags(['tag@'])).toBe(false); // Invalid character
      expect(validateTags(['tag--name'])).toBe(false); // Double hyphen
    });
  });

  describe('generatePermlink', () => {
    test('should generate valid permlinks', () => {
      const permlink1 = generatePermlink('Hello World');
      const permlink2 = generatePermlink('Special Characters!@#$%');
      
      expect(permlink1).toMatch(/^hello-world-\d{8}$/);
      expect(permlink2).toMatch(/^special-characters-\d{8}$/);
    });

    test('should handle empty titles', () => {
      const permlink = generatePermlink('');
      expect(permlink).toMatch(/^post-\d{8}$/);
    });

    test('should generate unique permlinks', () => {
      const permlink1 = generatePermlink('Same Title');
      const permlink2 = generatePermlink('Same Title');
      
      expect(permlink1).not.toBe(permlink2);
    });
  });
});
