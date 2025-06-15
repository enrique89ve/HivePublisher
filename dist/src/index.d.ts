/**
 * HiveTS - Lightweight TypeScript library for Hive blockchain operations
 *
 * @fileoverview Main entry point providing core functionality for Hive blockchain interactions
 * @version 1.0.0
 * @author HiveTS Contributors
 *
 * @example
 * ```typescript
 * import { HiveClient, createPost, upvote, getAccountInfo } from 'hivets';
 *
 * // Get account information
 * const account = await getAccountInfo('username');
 *
 * // Create a post
 * const result = await createPost(credentials, {
 *   title: 'Hello Hive',
 *   body: 'My first post using HiveTS',
 *   tags: ['introduction', 'hivets']
 * });
 * ```
 */
export { HiveClient } from './hive-client.js';
export * from './types.js';
export { createPost, editPost, upvote } from './operations.js';
export { getAccountInfo } from './accounts.js';
//# sourceMappingURL=index.d.ts.map