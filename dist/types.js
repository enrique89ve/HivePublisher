"use strict";
/**
 * TypeScript type definitions for Hive blockchain operations
 * @fileoverview Comprehensive type definitions with JSDoc documentation
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_CODES = exports.HiveError = void 0;
// ============================================================================
// Error Types
// ============================================================================
/**
 * Custom error class for Hive-related operations * @example
 * ```typescript
 * throw new HiveError('Invalid posting key provided', 'INVALID_CREDENTIALS', {
 *   username: 'alice'
 * });
 * ```
 */
class HiveError extends Error {
    constructor(message, code = 'UNKNOWN_ERROR', context, cause) {
        super(message);
        this.name = 'HiveError';
        this.code = code;
        if (context !== undefined) {
            this.context = context;
        }
        if (cause !== undefined) {
            this.cause = cause;
        }
        // Maintains proper stack trace for where our error was thrown (Node.js only)
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, HiveError);
        }
    }
}
exports.HiveError = HiveError;
// ============================================================================
// Common Error Codes
// ============================================================================
/**
 * Standard error codes used throughout the library
 */
exports.ERROR_CODES = {
    // Authentication errors
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    MISSING_POSTING_KEY: 'MISSING_POSTING_KEY',
    INVALID_PRIVATE_KEY: 'INVALID_PRIVATE_KEY',
    // Validation errors
    INVALID_USERNAME: 'INVALID_USERNAME',
    INVALID_PERMLINK: 'INVALID_PERMLINK',
    INVALID_TAGS: 'INVALID_TAGS',
    MISSING_TITLE: 'MISSING_TITLE',
    MISSING_BODY: 'MISSING_BODY',
    INVALID_VOTE_WEIGHT: 'INVALID_VOTE_WEIGHT',
    // Network errors
    NETWORK_ERROR: 'NETWORK_ERROR',
    NODE_UNAVAILABLE: 'NODE_UNAVAILABLE',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR',
    ALL_NODES_FAILED: 'ALL_NODES_FAILED',
    // Blockchain errors
    TRANSACTION_FAILED: 'TRANSACTION_FAILED',
    INSUFFICIENT_RC: 'INSUFFICIENT_RC',
    DUPLICATE_TRANSACTION: 'DUPLICATE_TRANSACTION',
    ACCOUNT_NOT_FOUND: 'ACCOUNT_NOT_FOUND',
    CONTENT_NOT_FOUND: 'CONTENT_NOT_FOUND',
    // General errors
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
    INVALID_RESPONSE: 'INVALID_RESPONSE',
};
// ============================================================================
//# sourceMappingURL=types.js.map