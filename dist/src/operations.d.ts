/**
 * Hive blockchain operations for posts
 */
import { HiveClient } from './hive-client.js';
import { HiveCredentials, PostMetadata, PublishResult } from './types.js';
/**
 * Create and publish a new post to Hive blockchain
 */
export declare function createPost(credentials: HiveCredentials, metadata: PostMetadata, client?: HiveClient): Promise<PublishResult>;
/**
 * Edit an existing post on Hive blockchain
 */
export declare function editPost(credentials: HiveCredentials, permlink: string, metadata: PostMetadata, client?: HiveClient): Promise<PublishResult>;
//# sourceMappingURL=operations.d.ts.map