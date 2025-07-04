/**
 * Utility functions for Hive operations
 */
const getSlug = require('speakingurl');

/**
 * Generate a random permlink suffix (similar to Ecency's permlinkRnd)
 */
function permlinkRnd(): string {
  return (Math.random() + 1).toString(16).substring(2);
}

/**
 * Generate a URL-friendly permlink from a title following Ecency's approach
 */
export function generatePermlink(title: string, random: boolean = false): string {
  const slug = getSlug(title);
  let perm = slug.toString();

  // Make shorter URL if possible (limit to 5 words like Ecency)
  const shortp = perm.split('-');
  if (shortp.length > 5) {
    perm = shortp.slice(0, 5).join('-');
  }

  if (random) {
    const rnd = permlinkRnd();
    perm = `${perm}-${rnd}`;
  }

  // HIVE_MAX_PERMLINK_LENGTH
  if (perm.length > 255) {
    perm = perm.substring(perm.length - 255, perm.length);
  }

  // Only letters, numbers and dashes
  perm = perm.toLowerCase().replace(/[^a-z0-9-]+/g, '');

  if (perm.length === 0) {
    return permlinkRnd();
  }

  return perm;
}

/**
 * Validate Hive username format
 */
export function validateUsername(username: string): boolean {
  if (!username || typeof username !== 'string') {
    return false;
  }

  // Hive username rules:
  // - 3-16 characters
  // - lowercase letters, numbers, hyphens, dots
  // - cannot start or end with hyphen or dot
  // - cannot have consecutive hyphens or dots
  const usernameRegex = /^[a-z0-9][a-z0-9.-]*[a-z0-9]$|^[a-z0-9]$/;

  return (
    username.length >= 3 &&
    username.length <= 16 &&
    usernameRegex.test(username) &&
    !username.includes('--') &&
    !username.includes('..')
  );
}

/**
 * Validate post tags
 */
export function validateTags(tags: string[]): boolean {
  if (!Array.isArray(tags)) {
    return false;
  }

  if (tags.length === 0 || tags.length > 5) {
    return false;
  }

  for (const tag of tags) {
    if (typeof tag !== 'string') {
      return false;
    }

    // Tag rules:
    // - 2-24 characters
    // - lowercase letters, numbers, hyphens
    // - cannot start with hyphen
    if (tag.length < 2 || tag.length > 24) {
      return false;
    }

    if (!/^[a-z0-9][a-z0-9-]*$/.test(tag)) {
      return false;
    }

    if (tag.includes('--')) {
      return false;
    }
  }

  return true;
}

/**
 * Format date for Hive blockchain
 */
export function formatHiveDate(date: Date): string {
  return date.toISOString().split('.')[0]!;
}

/**
 * Parse Hive date string
 */
export function parseHiveDate(dateString: string): Date {
  return new Date(dateString + 'Z');
}

/**
 * Sanitize post body content
 */
export function sanitizeBody(body: string): string {
  if (!body || typeof body !== 'string') {
    return '';
  }

  // Remove potentially harmful content while preserving markdown
  return body
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Calculate approximate reading time
 */
export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Extract excerpt from post body
 */
export function extractExcerpt(body: string, maxLength: number = 200): string {
  if (!body || typeof body !== 'string') {
    return '';
  }

  // Remove markdown formatting for excerpt
  const plainText = body
    .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
    .replace(/\[.*?\]\(.*?\)/g, '') // Remove links
    .replace(/[#*`_~]/g, '') // Remove formatting
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return plainText.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}
