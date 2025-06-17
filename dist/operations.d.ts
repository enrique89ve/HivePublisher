/**
 * Hive blockchain operations for posts
 */
import { HiveClient } from './hive-client.js';
import { HiveCredentials, PostMetadata, PostUpdateOptions, PublishResult, VoteResult } from './types.js';
/**
 * Create and publish a new post to Hive blockchain
 *
 * @param credentialsOrMetadata - Hive account credentials or post metadata (if using env credentials)
 * @param metadata - Post content (required if first param is credentials)
 * @param client - Optional HiveClient instance for custom configuration
 * @returns Promise resolving to PublishResult with success status and transaction ID
 *
 * @example
 * ```typescript
 * // With explicit credentials
 * const result = await createPost(
 *   { username: 'alice', postingKey: 'key...' },
 *   { title: 'Hello World', body: 'My first post', tags: ['introduction'] }
 * );
 *
 * // With automatic credentials from .env (HIVE_USERNAME, HIVE_POSTING_KEY)
 * const result = await createPost({
 *   title: 'Hello World',
 *   body: 'My first post',
 *   tags: ['introduction']
 * });
 * ```
 */
export declare function createPost(credentialsOrMetadata: HiveCredentials | PostMetadata, metadataOrClient?: PostMetadata | HiveClient, client?: HiveClient): Promise<PublishResult>;
/**
 * Edit an existing post by automatically fetching current content and applying updates
 *
 * The function fetches the existing post content and applies the update according to the
 * specified mode, respecting the user's content exactly without adding any extra formatting.
 *
 * @param credentialsOrPermlink - Hive account credentials or permlink (if using env credentials)
 * @param permlinkOrUpdates - Post permlink or update object (if first param is credentials)
 * @param updatesOrClient - Update object or client (if first param is permlink)
 * @param client - Optional HiveClient instance for custom configuration
 * @returns Promise resolving to PublishResult with success status and transaction ID
 *
 * @example
 * ```typescript
 * // With explicit credentials - add content to the end (default)
 * const result = await editPost(
 *   { username: 'alice', postingKey: 'key...' },
 *   'my-post-permlink',
 *   { newContent: 'New information added!' }
 * );
 *
 * // With automatic credentials - add content to the beginning
 * const result = await editPost('my-post-permlink', {
 *   newContent: 'Important update at the top!',
 *   mode: 'prepend'
 * });
 *
 * // Replace entire content
 * const result = await editPost('my-post-permlink', {
 *   title: 'Updated Title',
 *   newContent: 'Completely new content',
 *   mode: 'replace'
 * });
 * ```
 */
export declare function editPost(credentialsOrPermlink: HiveCredentials | string, permlinkOrUpdates?: string | PostUpdateOptions, updatesOrClient?: PostUpdateOptions | HiveClient, client?: HiveClient): Promise<PublishResult>;
/**
 * Upvote a post or comment on Hive blockchain
 *
 * @param credentialsOrAuthor - Hive credentials object OR author username (if using env credentials)
 * @param authorOrPermlink - Author username OR permlink (if first param is credentials)
 * @param permlinkOrWeight - Permlink OR vote weight percentage (if first param is author)
 * @param weightOrClient - Vote weight percentage OR HiveClient instance
 * @param client - Optional HiveClient instance for custom configuration
 * @returns Promise resolving to VoteResult with success status and transaction ID
 *
 * @example
 * ```typescript
 * // With explicit credentials
 * const result = await upvote(
 *   { username: 'alice', postingKey: 'key...' },
 *   'author', 'post-permlink', 100
 * );
 *
 * // With automatic credentials from .env
 * const result = await upvote('author', 'post-permlink', 100);
 *
 * // Default 100% vote
 * const result = await upvote('author', 'post-permlink');
 * ```
 */
export declare function upvote(credentialsOrAuthor: HiveCredentials | string, authorOrPermlink?: string, permlinkOrWeight?: string | number, weightOrClient?: number | HiveClient, client?: HiveClient): Promise<VoteResult>;
//# sourceMappingURL=operations.d.ts.map