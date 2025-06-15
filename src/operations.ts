/**
 * Hive blockchain operations for posts
 */

import { HiveClient } from './hive-client.js';
import { 
  HiveCredentials, 
  PostMetadata, 
  PostOperation, 
  PublishResult, 
  VoteResult,
  HiveError 
} from './types.js';
import { parsePrivateKey } from './crypto.js';
import { generatePermlink, validateUsername, validateTags } from './utils.js';

/**
 * Create and publish a new post to Hive blockchain
 */
export async function createPost(
  credentials: HiveCredentials,
  metadata: PostMetadata,
  client?: HiveClient
): Promise<PublishResult> {
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

    // Dynamic import for ES module compatibility
    const { Transaction } = await import('hive-tx');
    
    // Create and sign transaction using hive-tx Transaction class
    const tx = new Transaction();
    await tx.create([commentOperation]);
    const signedTransaction = tx.sign(privateKey);

    // Get transaction digest for ID
    const { txId } = tx.digest();

    // Broadcast transaction
    const result = await hiveClient.broadcastTransaction(signedTransaction);
    const transactionId = txId || result.id || result.tx_id;

    return {
      success: true,
      transaction_id: transactionId
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof HiveError ? error.message : `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Edit an existing post on Hive blockchain
 */
export async function editPost(
  credentials: HiveCredentials,
  permlink: string,
  metadata: PostMetadata,
  client?: HiveClient
): Promise<PublishResult> {
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
    const editOp: PostOperation = {
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

    // Dynamic import for ES module compatibility
    const { Transaction } = await import('hive-tx');
    
    // Create and sign transaction using hive-tx Transaction class
    const tx = new Transaction();
    await tx.create([editOperation]);
    const signedTransaction = tx.sign(privateKey);

    // Get transaction digest for ID
    const { txId } = tx.digest();

    // Broadcast transaction
    const result = await hiveClient.broadcastTransaction(signedTransaction);
    const transactionId = txId || result.id || result.tx_id;

    return {
      success: true,
      transaction_id: transactionId
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof HiveError ? error.message : `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Upvote a post or comment on Hive blockchain
 */
export async function upvote(
  credentials: HiveCredentials,
  author: string,
  permlink: string,
  weight: number = 100,
  client?: HiveClient
): Promise<VoteResult> {
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

    // Dynamic import for ES module compatibility
    const { Transaction } = await import('hive-tx');
    
    // Create and sign transaction using hive-tx Transaction class
    const tx = new Transaction();
    await tx.create([voteOperation]);
    const signedTransaction = tx.sign(privateKey);

    // Get transaction digest for ID
    const { txId } = tx.digest();

    // Broadcast transaction
    const result = await hiveClient.broadcastTransaction(signedTransaction);
    const transactionId = txId || result.id || result.tx_id;

    return {
      success: true,
      transaction_id: transactionId
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof HiveError ? error.message : `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
