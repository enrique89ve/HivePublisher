/**
 * Hive blockchain operations for posts
 */
import { HiveClient } from './hive-client.js';
import { HiveError } from './types.js';
import { parsePrivateKey, createHiveTransaction, signHiveTransaction } from './crypto.js';
import { generatePermlink, validateUsername, validateTags } from './utils.js';
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
export async function createPost(credentials, metadata, client) {
    try {
        const hiveClient = client || new HiveClient();
        // Validate input
        if (!validateUsername(credentials.username)) {
            throw new HiveError('Invalid username format');
        }
        if (!validateTags(metadata.tags)) {
            throw new HiveError('Invalid tags: maximum 5 tags allowed, each tag must be lowercase and contain only letters, numbers, and hyphens');
        }
        // Only validate title for root posts (not comments)
        const isComment = metadata.parent_author && metadata.parent_permlink;
        if (!isComment && !metadata.title.trim()) {
            throw new HiveError('Title cannot be empty');
        }
        if (!metadata.body.trim()) {
            throw new HiveError('Body cannot be empty');
        }
        // Generate permlink if not provided
        const permlink = generatePermlink(metadata.title);
        // Check if account exists
        const account = await hiveClient.getAccount(credentials.username);
        if (!account) {
            throw new HiveError(`Account ${credentials.username} not found`);
        }
        // Prepare JSON metadata
        const jsonMetadata = {
            tags: metadata.tags,
            app: 'hivets/1.0.0',
            format: 'markdown',
            ...metadata.json_metadata
        };
        // Create comment operation for post
        const commentOperation = [
            'comment',
            {
                parent_author: metadata.parent_author || '',
                parent_permlink: metadata.parent_permlink || metadata.tags[0] || 'general',
                author: credentials.username,
                permlink,
                title: metadata.title,
                body: metadata.body,
                json_metadata: JSON.stringify(jsonMetadata)
            }
        ];
        // Parse private key
        const privateKey = parsePrivateKey(credentials.postingKey);
        // Get dynamic global properties for transaction reference
        const props = await hiveClient.getDynamicGlobalProperties();
        const refBlockNum = props.head_block_number & 0xFFFF;
        const refBlockPrefix = parseInt(props.head_block_id.substring(8, 16), 16);
        const expiration = new Date(Date.now() + 60000).toISOString().slice(0, -5);
        // Create and sign transaction using our lightweight implementation
        const transaction = createHiveTransaction([commentOperation], {
            ref_block_num: refBlockNum,
            ref_block_prefix: refBlockPrefix,
            expiration: expiration
        });
        const signedTransaction = signHiveTransaction(transaction, privateKey);
        // Broadcast transaction
        const result = await hiveClient.broadcastTransaction(signedTransaction);
        const transactionId = signedTransaction.transaction_id || result.id || result.tx_id;
        return {
            success: true,
            transaction_id: transactionId
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof HiveError ? error.message : `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}
/**
 * Edit an existing post on Hive blockchain
 */
export async function editPost(credentials, permlink, metadata, client) {
    try {
        const hiveClient = client || new HiveClient();
        // Validate input
        if (!validateUsername(credentials.username)) {
            throw new HiveError('Invalid username format');
        }
        if (!permlink.trim()) {
            throw new HiveError('Permlink cannot be empty');
        }
        if (!validateTags(metadata.tags)) {
            throw new HiveError('Invalid tags: maximum 5 tags allowed, each tag must be lowercase and contain only letters, numbers, and hyphens');
        }
        // Check if post exists
        const existingPost = await hiveClient.getContent(credentials.username, permlink);
        if (!existingPost || !existingPost.author) {
            throw new HiveError(`Post not found: @${credentials.username}/${permlink}`);
        }
        // Check if user is the author
        if (existingPost.author !== credentials.username) {
            throw new HiveError('You can only edit your own posts');
        }
        // Prepare JSON metadata
        const jsonMetadata = {
            tags: metadata.tags,
            app: 'hivets/1.0.0',
            format: 'markdown',
            ...metadata.json_metadata
        };
        // Create edit operation (same as comment operation)
        const editOp = {
            parent_author: existingPost.parent_author,
            parent_permlink: existingPost.parent_permlink,
            author: credentials.username,
            permlink,
            title: metadata.title,
            body: metadata.body,
            json_metadata: JSON.stringify(jsonMetadata)
        };
        // Create edit operation for hive-tx
        const editOperation = [
            'comment',
            {
                parent_author: existingPost.parent_author,
                parent_permlink: existingPost.parent_permlink,
                author: credentials.username,
                permlink,
                title: metadata.title,
                body: metadata.body,
                json_metadata: JSON.stringify(jsonMetadata)
            }
        ];
        // Parse private key
        const privateKey = parsePrivateKey(credentials.postingKey);
        // Get dynamic global properties for transaction reference
        const props = await hiveClient.getDynamicGlobalProperties();
        const refBlockNum = props.head_block_number & 0xFFFF;
        const refBlockPrefix = parseInt(props.head_block_id.substring(8, 16), 16);
        const expiration = new Date(Date.now() + 60000).toISOString().slice(0, -5);
        // Create and sign transaction using our lightweight implementation
        const transaction = createHiveTransaction([editOperation], {
            ref_block_num: refBlockNum,
            ref_block_prefix: refBlockPrefix,
            expiration: expiration
        });
        const signedTransaction = signHiveTransaction(transaction, privateKey);
        // Broadcast transaction
        const result = await hiveClient.broadcastTransaction(signedTransaction);
        const transactionId = signedTransaction.transaction_id || result.id || result.tx_id;
        return {
            success: true,
            transaction_id: transactionId
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof HiveError ? error.message : `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}
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
export async function upvote(credentials, author, permlink, weight = 100, client) {
    try {
        const hiveClient = client || new HiveClient();
        // Validate input
        if (!validateUsername(credentials.username)) {
            throw new HiveError('Invalid username format');
        }
        if (!validateUsername(author)) {
            throw new HiveError('Invalid author username format');
        }
        if (!permlink || permlink.trim() === '') {
            throw new HiveError('Permlink cannot be empty');
        }
        // Validate weight (0-100% converted to 0-10000)
        if (weight < 0 || weight > 100) {
            throw new HiveError('Vote weight must be between 0 and 100 percent');
        }
        // Convert percentage to Hive weight format (0-10000)
        const hiveWeight = Math.floor(weight * 100);
        // Check if voter account exists
        const voterAccount = await hiveClient.getAccount(credentials.username);
        if (!voterAccount) {
            throw new HiveError(`Voter account ${credentials.username} not found`);
        }
        // Check if target post/comment exists
        const targetPost = await hiveClient.getContent(author, permlink);
        if (!targetPost || !targetPost.author) {
            throw new HiveError(`Post or comment @${author}/${permlink} not found`);
        }
        // Create vote operation
        const voteOperation = [
            'vote',
            {
                voter: credentials.username,
                author: author,
                permlink: permlink,
                weight: hiveWeight
            }
        ];
        // Parse private key
        const privateKey = parsePrivateKey(credentials.postingKey);
        // Get dynamic global properties for transaction reference
        const props = await hiveClient.getDynamicGlobalProperties();
        const refBlockNum = props.head_block_number & 0xFFFF;
        const refBlockPrefix = parseInt(props.head_block_id.substring(8, 16), 16);
        const expiration = new Date(Date.now() + 60000).toISOString().slice(0, -5);
        // Create and sign transaction using our lightweight implementation
        const transaction = createHiveTransaction([voteOperation], {
            ref_block_num: refBlockNum,
            ref_block_prefix: refBlockPrefix,
            expiration: expiration
        });
        const signedTransaction = signHiveTransaction(transaction, privateKey);
        // Broadcast transaction
        const result = await hiveClient.broadcastTransaction(signedTransaction);
        const transactionId = signedTransaction.transaction_id || result.id || result.tx_id;
        return {
            success: true,
            transaction_id: transactionId
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof HiveError ? error.message : `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}
//# sourceMappingURL=operations.js.map