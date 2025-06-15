"use strict";
/**
 * Hive blockchain operations for posts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPost = createPost;
exports.editPost = editPost;
const hive_client_1 = require("./hive-client");
const types_1 = require("./types");
const crypto_1 = require("./crypto");
const hive_tx_1 = require("hive-tx");
const utils_1 = require("./utils");
/**
 * Create and publish a new post to Hive blockchain
 */
async function createPost(credentials, metadata, client) {
    try {
        const hiveClient = client || new hive_client_1.HiveClient();
        // Validate input
        if (!(0, utils_1.validateUsername)(credentials.username)) {
            throw new types_1.HiveError('Invalid username format');
        }
        if (!(0, utils_1.validateTags)(metadata.tags)) {
            throw new types_1.HiveError('Invalid tags: maximum 5 tags allowed, each tag must be lowercase and contain only letters, numbers, and hyphens');
        }
        if (!metadata.title.trim()) {
            throw new types_1.HiveError('Title cannot be empty');
        }
        if (!metadata.body.trim()) {
            throw new types_1.HiveError('Body cannot be empty');
        }
        // Generate permlink if not provided
        const permlink = (0, utils_1.generatePermlink)(metadata.title);
        // Check if account exists
        const account = await hiveClient.getAccount(credentials.username);
        if (!account) {
            throw new types_1.HiveError(`Account ${credentials.username} not found`);
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
        const privateKey = (0, crypto_1.parsePrivateKey)(credentials.postingKey);
        // Create and sign transaction using hive-tx
        const transaction = await (0, hive_tx_1.createTransaction)([commentOperation]);
        const signedTransaction = (0, hive_tx_1.signTransaction)(transaction, [privateKey]);
        // Broadcast transaction
        const result = await hiveClient.broadcastTransaction(signedTransaction);
        const transactionId = signedTransaction.transaction_id || result.id;
        return {
            success: true,
            transaction_id: transactionId
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof types_1.HiveError ? error.message : `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}
/**
 * Edit an existing post on Hive blockchain
 */
async function editPost(credentials, permlink, metadata, client) {
    try {
        const hiveClient = client || new hive_client_1.HiveClient();
        // Validate input
        if (!(0, utils_1.validateUsername)(credentials.username)) {
            throw new types_1.HiveError('Invalid username format');
        }
        if (!permlink.trim()) {
            throw new types_1.HiveError('Permlink cannot be empty');
        }
        if (!(0, utils_1.validateTags)(metadata.tags)) {
            throw new types_1.HiveError('Invalid tags: maximum 5 tags allowed, each tag must be lowercase and contain only letters, numbers, and hyphens');
        }
        // Check if post exists
        const existingPost = await hiveClient.getContent(credentials.username, permlink);
        if (!existingPost || !existingPost.author) {
            throw new types_1.HiveError(`Post not found: @${credentials.username}/${permlink}`);
        }
        // Check if user is the author
        if (existingPost.author !== credentials.username) {
            throw new types_1.HiveError('You can only edit your own posts');
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
        // Get dynamic global properties for transaction reference
        const props = await hiveClient.getDynamicGlobalProperties();
        // Create transaction
        const transaction = {
            ref_block_num: props.head_block_number & 0xFFFF,
            ref_block_prefix: parseInt(props.head_block_id.substring(8, 16), 16),
            expiration: new Date(Date.now() + 60000).toISOString().split('.')[0], // 1 minute from now
            operations: [['comment', editOp]],
            extensions: [],
            signatures: []
        };
        // Parse private key and sign transaction
        const privateKey = (0, crypto_1.parsePrivateKey)(credentials.postingKey);
        const signature = await (0, hive_tx_1.signTransaction)(transaction, privateKey);
        transaction.signatures = [signature];
        // Broadcast transaction
        const result = await hiveClient.broadcastTransaction(transaction);
        const transactionId = await generateTransactionId(transaction);
        return {
            success: true,
            transaction_id: transactionId
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof types_1.HiveError ? error.message : `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}
//# sourceMappingURL=operations.js.map