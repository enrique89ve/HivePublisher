"use strict";
/**
 * Utility functions for Hive operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePermlink = generatePermlink;
exports.validateUsername = validateUsername;
exports.validateTags = validateTags;
exports.formatHiveDate = formatHiveDate;
exports.parseHiveDate = parseHiveDate;
exports.sanitizeBody = sanitizeBody;
exports.calculateReadingTime = calculateReadingTime;
exports.extractExcerpt = extractExcerpt;
/**
 * Generate a URL-friendly permlink from a title
 */
function generatePermlink(title) {
    const timestamp = Math.floor(Date.now() / 1000);
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
        .substring(0, 50) // Limit length
        + '-' + timestamp;
}
/**
 * Validate Hive username format
 */
function validateUsername(username) {
    if (!username || typeof username !== 'string') {
        return false;
    }
    // Hive username rules:
    // - 3-16 characters
    // - lowercase letters, numbers, hyphens
    // - cannot start or end with hyphen
    // - cannot have consecutive hyphens
    const usernameRegex = /^[a-z][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/;
    return username.length >= 3 &&
        username.length <= 16 &&
        usernameRegex.test(username) &&
        !username.includes('--');
}
/**
 * Validate post tags
 */
function validateTags(tags) {
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
function formatHiveDate(date) {
    return date.toISOString().split('.')[0];
}
/**
 * Parse Hive date string
 */
function parseHiveDate(dateString) {
    return new Date(dateString + 'Z');
}
/**
 * Sanitize post body content
 */
function sanitizeBody(body) {
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
function calculateReadingTime(text) {
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
}
/**
 * Extract excerpt from post body
 */
function extractExcerpt(body, maxLength = 200) {
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
//# sourceMappingURL=utils.js.map