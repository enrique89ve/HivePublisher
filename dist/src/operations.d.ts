/**
 * Hive blockchain operations for posts
 */
import { HiveClient } from './hive-client.js';
import { HiveCredentials, PostMetadata, PublishResult, VoteResult } from './types.js';
/**
 * Create and publish a new post to Hive blockchain
 *
 * @param credentials - Hive account credentials containing username and posting key
 * @param metadata - Post content including title, body, and tags
 * @param client - Optional HiveClient instance for custom configuration
 * @returns Promise resolving to PublishResult with success status and transaction ID
 *
 * @example
 * ```typescript
 * const result = await createPost(
 *   { username: 'alice', postingKey: 'key...' },
 *   {
 *     title: 'Hello World',
 *     body: 'My first post',
 *     tags: ['introduction']
 *   }
 * );
 *
 * if (result.success) {
 *   console.log(`Post created: ${result.transaction_id}`);
 * }
 * ```
 */
export declare function createPost(credentials: HiveCredentials, metadata: PostMetadata, client?: HiveClient): Promise<PublishResult>;
/**
 * Edit an existing post on Hive blockchain
 */
export declare function editPost(credentials: HiveCredentials, permlink: string, metadata: PostMetadata, client?: HiveClient): Promise<PublishResult>;
/**
 * Upvote a post or comment on Hive blockchain
 *
 * @param credentials - Hive account credentials for the voter
 * @param author - Username of the post/comment author
 * @param permlink - Unique identifier of the post/comment
 * @param weight - Vote weight as percentage (0-100, default: 100)
 * @param client - Optional HiveClient instance for custom configuration
 * @returns Promise resolving to VoteResult with success status and transaction ID
 *
 * @example
 * ```typescript
 * // Full upvote (100%)
 * const result = await upvote(credentials, 'author', 'post-permlink');
 *
 * // Partial upvote (75%)
 * const result = await upvote(credentials, 'author', 'post-permlink', 75);
 *
 * if (result.success) {
 *   console.log(`Vote cast: ${result.transaction_id}`);
 * }
 * ```
 */
export declare function upvote(credentials: HiveCredentials, author: string, permlink: string, weight?: number, client?: HiveClient): Promise<VoteResult>;
//# sourceMappingURL=operations.d.ts.map