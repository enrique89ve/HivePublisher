/**
 * Hive blockchain operations for posts
 */
import { HiveClient } from './hive-client.js';
import { HiveCredentials, PostMetadata, PublishResult, VoteResult } from './types.js';
/**
 * Create and publish a new post to Hive blockchain
 */
export declare function createPost(credentials: HiveCredentials, metadata: PostMetadata, client?: HiveClient): Promise<PublishResult>;
/**
 * Edit an existing post on Hive blockchain
 */
export declare function editPost(credentials: HiveCredentials, permlink: string, metadata: PostMetadata, client?: HiveClient): Promise<PublishResult>;
/**
 * Upvote a post or comment on Hive blockchain
 */
export declare function upvote(credentials: HiveCredentials, author: string, permlink: string, weight?: number, client?: HiveClient): Promise<VoteResult>;
//# sourceMappingURL=operations.d.ts.map