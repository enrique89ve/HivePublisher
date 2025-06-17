/**
 * Hive blockchain operations for posts
 */

import { HiveClient } from './hive-client.js';
import { createConfigFromEnv, getEnvCredentials } from './config.js';
import {
  HiveCredentials,
  PostMetadata,
  PostUpdateOptions,
  PostOperation,
  PublishResult,
  VoteResult,
  HiveError,
} from './types.js';
import { parsePrivateKey } from './crypto.js';
import { generatePermlink, validateUsername, validateTags } from './utils.js';

/**
 * Helper function to resolve credentials from various sources
 * @param credentialsOrData - Credentials object or other data if no credentials provided
 * @returns Resolved credentials from explicit input or environment variables
 */
function resolveCredentials(credentialsOrData?: any): HiveCredentials {
  // If it's a credentials object, use it directly
  if (
    credentialsOrData &&
    typeof credentialsOrData === 'object' &&
    credentialsOrData.username &&
    credentialsOrData.postingKey
  ) {
    return credentialsOrData;
  }

  // Otherwise, try to get from environment
  const envCredentials = getEnvCredentials();
  if (!envCredentials.username || !envCredentials.postingKey) {
    throw new HiveError(
      'No credentials provided. Either pass credentials object or set HIVE_USERNAME and HIVE_POSTING_KEY in environment variables'
    );
  }

  return {
    username: envCredentials.username,
    postingKey: envCredentials.postingKey,
  };
}

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
export async function createPost(
  credentialsOrMetadata: HiveCredentials | PostMetadata,
  metadataOrClient?: PostMetadata | HiveClient,
  client?: HiveClient
): Promise<PublishResult> {
  try {
    // Resolve credentials and metadata based on parameters
    let credentials: HiveCredentials;
    let metadata: PostMetadata;
    let hiveClient: HiveClient;

    // Check if first parameter is credentials or metadata
    if (
      credentialsOrMetadata &&
      'username' in credentialsOrMetadata &&
      'postingKey' in credentialsOrMetadata
    ) {
      // First param is credentials, second is metadata
      credentials = credentialsOrMetadata;
      metadata = metadataOrClient as PostMetadata;
      hiveClient = client || new HiveClient(createConfigFromEnv());
    } else {
      // First param is metadata, use env credentials
      credentials = resolveCredentials();
      metadata = credentialsOrMetadata as PostMetadata;
      hiveClient = (metadataOrClient as HiveClient) || new HiveClient(createConfigFromEnv());
    }

    // Validate input
    if (!validateUsername(credentials.username)) {
      throw new HiveError('Invalid username format');
    }

    if (!validateTags(metadata.tags)) {
      throw new HiveError(
        'Invalid tags: maximum 5 tags allowed, each tag must be lowercase and contain only letters, numbers, and hyphens'
      );
    }

    // Only validate title for root posts (not comments)
    const isComment = metadata.parent_author && metadata.parent_permlink;
    if (!isComment && !metadata.title.trim()) {
      throw new HiveError('Title cannot be empty');
    }

    if (!metadata.body.trim()) {
      throw new HiveError('Body cannot be empty');
    }

    // Generate permlink and handle collisions (following Ecency's approach)
    let permlink = generatePermlink(metadata.title);

    // Permlink duplication check
    try {
      const exists = await import('./content.js').then(m =>
        m.postExists(credentials.username, permlink, hiveClient)
      );
      if (exists) {
        // Create permlink with random suffix if collision detected
        permlink = generatePermlink(metadata.title, true);
      }
    } catch (error) {
      // If there's an error checking for collision, proceed with original permlink
      // This is a safety fallback - in most cases the check should work
    }

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
      ...metadata.json_metadata,
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
        json_metadata: JSON.stringify(jsonMetadata),
      },
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
      transaction_id: transactionId,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof HiveError
          ? error.message
          : `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

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
export async function editPost(
  credentialsOrPermlink: HiveCredentials | string,
  permlinkOrUpdates?: string | PostUpdateOptions,
  updatesOrClient?: PostUpdateOptions | HiveClient,
  client?: HiveClient
): Promise<PublishResult> {
  try {
    // Resolve credentials, permlink and updates based on parameters
    let credentials: HiveCredentials;
    let permlink: string;
    let updates: PostUpdateOptions;
    let hiveClient: HiveClient;

    // Check if first parameter is credentials or permlink
    if (
      credentialsOrPermlink &&
      typeof credentialsOrPermlink === 'object' &&
      'username' in credentialsOrPermlink &&
      'postingKey' in credentialsOrPermlink
    ) {
      // First param is credentials
      credentials = credentialsOrPermlink;
      permlink = permlinkOrUpdates as string;
      updates = updatesOrClient as PostUpdateOptions;
      hiveClient = client || new HiveClient(createConfigFromEnv());
    } else {
      // First param is permlink, use env credentials
      credentials = resolveCredentials();
      permlink = credentialsOrPermlink as string;
      updates = permlinkOrUpdates as PostUpdateOptions;
      hiveClient = (updatesOrClient as HiveClient) || new HiveClient(createConfigFromEnv());
    }

    // Validate input
    if (!validateUsername(credentials.username)) {
      throw new HiveError('Invalid username format');
    }

    if (!permlink.trim()) {
      throw new HiveError('Permlink cannot be empty');
    }

    if (!updates.newContent.trim()) {
      throw new HiveError('New content cannot be empty');
    }

    // Get existing post content
    const existingPost = await hiveClient.getContent(credentials.username, permlink);
    if (!existingPost || !existingPost.author) {
      throw new HiveError(`Post not found: @${credentials.username}/${permlink}`);
    }

    // Check if user is the author
    if (existingPost.author !== credentials.username) {
      throw new HiveError('You can only edit your own posts');
    }

    // Parse existing JSON metadata
    let existingMetadata;
    try {
      existingMetadata = JSON.parse(existingPost.json_metadata || '{}');
    } catch {
      existingMetadata = {};
    }

    // Build updated content based on mode - respecting user content exactly
    const mode = updates.mode || 'append'; // Default to append
    const updatedTitle = updates.title ?? existingPost.title;
    let updatedBody: string;

    switch (mode) {
      case 'prepend':
        updatedBody = updates.newContent + '\n\n' + existingPost.body;
        break;
      case 'append':
        updatedBody = existingPost.body + '\n\n' + updates.newContent;
        break;
      case 'replace':
        updatedBody = updates.newContent;
        break;
      default:
        throw new HiveError(`Invalid edit mode: ${mode}. Use 'prepend', 'append', or 'replace'`);
    }

    const updatedTags = updates.tags ?? existingMetadata.tags ?? [];

    // Validate updated content
    if (!validateTags(updatedTags)) {
      throw new HiveError(
        'Invalid tags: maximum 5 tags allowed, each tag must be lowercase and contain only letters, numbers, and hyphens'
      );
    }

    if (!updatedTitle.trim()) {
      throw new HiveError('Title cannot be empty');
    }

    if (!updatedBody.trim()) {
      throw new HiveError('Body cannot be empty');
    }

    // Prepare updated JSON metadata
    const jsonMetadata = {
      ...existingMetadata,
      tags: updatedTags,
      app: 'hivets/1.0.0',
      format: 'markdown',
      ...updates.json_metadata,
    };

    // Create edit operation
    const editOperation = [
      'comment',
      {
        parent_author: existingPost.parent_author,
        parent_permlink: existingPost.parent_permlink,
        author: credentials.username,
        permlink,
        title: updatedTitle,
        body: updatedBody,
        json_metadata: JSON.stringify(jsonMetadata),
      },
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
      transaction_id: transactionId,
      updated_content: {
        title: updatedTitle,
        body: updatedBody,
        tags: updatedTags,
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof HiveError
          ? error.message
          : `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

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
export async function upvote(
  credentialsOrAuthor: HiveCredentials | string,
  authorOrPermlink?: string,
  permlinkOrWeight?: string | number,
  weightOrClient?: number | HiveClient,
  client?: HiveClient
): Promise<VoteResult> {
  try {
    // Resolve parameters based on types
    let credentials: HiveCredentials;
    let author: string;
    let permlink: string;
    let weight: number = 100;
    let hiveClient: HiveClient;

    // Check if first parameter is credentials or author
    if (
      credentialsOrAuthor &&
      typeof credentialsOrAuthor === 'object' &&
      'username' in credentialsOrAuthor &&
      'postingKey' in credentialsOrAuthor
    ) {
      // Format: upvote(credentials, author, permlink, weight?, client?)
      credentials = credentialsOrAuthor;
      author = authorOrPermlink!;
      permlink = permlinkOrWeight as string;
      weight = typeof weightOrClient === 'number' ? weightOrClient : 100;
      hiveClient =
        (typeof weightOrClient === 'object' ? weightOrClient : client) ||
        new HiveClient(createConfigFromEnv());
    } else {
      // Format: upvote(author, permlink, weight?, client?) - use env credentials
      credentials = resolveCredentials();
      author = credentialsOrAuthor as string;
      permlink = authorOrPermlink!;
      weight = typeof permlinkOrWeight === 'number' ? permlinkOrWeight : 100;
      hiveClient =
        (typeof weightOrClient === 'object' ? weightOrClient : client) ||
        new HiveClient(createConfigFromEnv());
    }

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
        weight: hiveWeight,
      },
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
      transaction_id: transactionId,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof HiveError
          ? error.message
          : `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
