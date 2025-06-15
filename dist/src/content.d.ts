/**
 * Hive blockchain content operations for posts and comments
 */
import { HiveClient } from './hive-client.js';
import { PostContent, CommentData } from './types.js';
/**
 * Get complete post content from Hive blockchain
 *
 * @param author - Username of the post author
 * @param permlink - Unique identifier of the post
 * @param client - Optional HiveClient instance for custom configuration
 * @returns Promise resolving to PostContent object or null if post not found
 *
 * @example
 * ```typescript
 * const post = await getPostContent('alice', 'my-first-post');
 * if (post) {
 *   console.log(`Title: ${post.title}`);
 *   console.log(`Body: ${post.body}`);
 *   console.log(`Votes: ${post.net_votes}`);
 * }
 * ```
 */
export declare function getPostContent(author: string, permlink: string, client?: HiveClient): Promise<PostContent | null>;
/**
 * Get comments for a specific post from Hive blockchain
 *
 * @param author - Username of the post author
 * @param permlink - Unique identifier of the post
 * @param client - Optional HiveClient instance for custom configuration
 * @returns Promise resolving to array of CommentData objects
 *
 * @example
 * ```typescript
 * const comments = await getComments('alice', 'my-first-post');
 * console.log(`Found ${comments.length} comments`);
 * comments.forEach(comment => {
 *   console.log(`@${comment.author}: ${comment.body.substring(0, 100)}...`);
 * });
 * ```
 */
export declare function getComments(author: string, permlink: string, client?: HiveClient): Promise<CommentData[]>;
//# sourceMappingURL=content.d.ts.map