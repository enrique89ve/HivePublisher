/**
 * Hive blockchain operations for posts
 */

import { HiveClient } from './hive-client';
import { 
  HiveCredentials, 
  PostMetadata, 
  PostOperation, 
  Transaction, 
  PublishResult, 
  HiveError 
} from './types';
import { parsePrivateKey, signTransaction, generateTransactionId } from './crypto';
import { generatePermlink, validateUsername, validateTags } from './utils';

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
    
    if (!metadata.title.trim()) {
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

    // Create post operation
    const postOp: PostOperation = {
      parent_author: metadata.parent_author || '',
      parent_permlink: metadata.parent_permlink || metadata.tags[0] || 'general',
      author: credentials.username,
      permlink,
      title: metadata.title,
      body: metadata.body,
      json_metadata: JSON.stringify(jsonMetadata)
    };

    // Get dynamic global properties for transaction reference
    const props = await hiveClient.getDynamicGlobalProperties();
    
    // Create transaction
    const transaction: Transaction = {
      ref_block_num: props.head_block_number & 0xFFFF,
      ref_block_prefix: parseInt(props.head_block_id.substring(8, 16), 16),
      expiration: new Date(Date.now() + 60000).toISOString().split('.')[0]!, // 1 minute from now
      operations: [['comment', postOp]],
      extensions: [],
      signatures: []
    };

    // Parse private key and sign transaction
    const privateKey = parsePrivateKey(credentials.postingKey);
    const signature = await signTransaction(transaction, privateKey);
    transaction.signatures = [signature];

    // Broadcast transaction
    const result = await hiveClient.broadcastTransaction(transaction);
    const transactionId = await generateTransactionId(transaction);

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

    // Get dynamic global properties for transaction reference
    const props = await hiveClient.getDynamicGlobalProperties();
    
    // Create transaction
    const transaction: Transaction = {
      ref_block_num: props.head_block_number & 0xFFFF,
      ref_block_prefix: parseInt(props.head_block_id.substring(8, 16), 16),
      expiration: new Date(Date.now() + 60000).toISOString().split('.')[0]!, // 1 minute from now
      operations: [['comment', editOp]],
      extensions: [],
      signatures: []
    };

    // Parse private key and sign transaction
    const privateKey = parsePrivateKey(credentials.postingKey);
    const signature = await signTransaction(transaction, privateKey);
    transaction.signatures = [signature];

    // Broadcast transaction
    const result = await hiveClient.broadcastTransaction(transaction);
    const transactionId = await generateTransactionId(transaction);

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
