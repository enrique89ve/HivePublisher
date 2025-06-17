/**
 * Hive blockchain content operations for posts and comments
 */

import { HiveClient } from './hive-client.js';
import { createConfigFromEnv } from './config.js';
import { HiveError, PostContent, CommentData } from './types.js';
import { validateUsername } from './utils.js';

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
export async function getPostContent(
  author: string,
  permlink: string,
  client?: HiveClient
): Promise<PostContent | null> {
  try {
    const hiveClient = client || new HiveClient(createConfigFromEnv());

    // Validate input parameters
    if (!validateUsername(author)) {
      throw new HiveError('Invalid author username format');
    }

    if (!permlink || permlink.trim().length === 0) {
      throw new HiveError('Permlink cannot be empty');
    }

    // Get post content using condenser API
    const content = await hiveClient.getContent(author, permlink);

    if (!content || !content.author) {
      return null;
    }

    // Parse JSON metadata safely
    let jsonMetadata = {};
    try {
      if (content.json_metadata && typeof content.json_metadata === 'string') {
        jsonMetadata = JSON.parse(content.json_metadata);
      } else if (content.json_metadata && typeof content.json_metadata === 'object') {
        jsonMetadata = content.json_metadata;
      }
    } catch (error) {
      // Invalid JSON metadata, use empty object
    }

    // Format the post content
    const postContent: PostContent = {
      id: content.id || 0,
      author: content.author,
      permlink: content.permlink,
      title: content.title || '',
      body: content.body || '',
      category: content.category || '',
      json_metadata: typeof jsonMetadata === 'string' ? jsonMetadata : JSON.stringify(jsonMetadata),
      // Optional posting metadata from blockchain, if available
      posting_metadata: content.posting_metadata
        ? JSON.stringify(content.posting_metadata)
        : undefined,
      // Normalize timestamps to full ISO format with milliseconds and Z
      created: content.created
        ? new Date(content.created + (content.created.endsWith('Z') ? '' : 'Z')).toISOString()
        : '',
      last_update: content.last_update
        ? new Date(
            content.last_update + (content.last_update.endsWith('Z') ? '' : 'Z')
          ).toISOString()
        : '',
      depth: content.depth || 0,
      children: content.children || 0,
      net_votes: content.net_votes || 0,
      pending_payout_value: content.pending_payout_value || '0.000 HBD',
      total_payout_value: content.total_payout_value || '0.000 HBD',
      curator_payout_value: content.curator_payout_value || '0.000 HBD',
      active: content.active || 'active',
      parent_author: content.parent_author || '',
      parent_permlink: content.parent_permlink || '',
      url: content.url || `/@${author}/${permlink}`,
      root_title: content.root_title || content.title || '',
      beneficiaries: content.beneficiaries || [],
      active_votes: content.active_votes || [],
    };

    return postContent;
  } catch (error) {
    if (error instanceof HiveError) {
      throw error;
    }
    throw new HiveError(
      `Failed to get post content: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

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
export async function getComments(
  author: string,
  permlink: string,
  client?: HiveClient
): Promise<CommentData[]> {
  try {
    const hiveClient = client || new HiveClient(createConfigFromEnv());

    // Validate input parameters
    if (!validateUsername(author)) {
      throw new HiveError('Invalid author username format');
    }

    if (!permlink || permlink.trim().length === 0) {
      throw new HiveError('Permlink cannot be empty');
    }

    // Get content replies using condenser API
    const replies = await hiveClient.call('condenser_api.get_content_replies', [author, permlink]);

    if (!Array.isArray(replies)) {
      return [];
    }

    // Process and format comments
    const comments: CommentData[] = replies.map((reply: any) => {
      // Parse JSON metadata safely
      let jsonMetadata = {};
      try {
        if (reply.json_metadata && typeof reply.json_metadata === 'string') {
          jsonMetadata = JSON.parse(reply.json_metadata);
        } else if (reply.json_metadata && typeof reply.json_metadata === 'object') {
          jsonMetadata = reply.json_metadata;
        }
      } catch (error) {
        // Invalid JSON metadata, use empty object
      }

      return {
        id: reply.id || 0,
        author: reply.author || '',
        permlink: reply.permlink || '',
        body: reply.body || '',
        json_metadata:
          typeof jsonMetadata === 'string' ? jsonMetadata : JSON.stringify(jsonMetadata),
        created: reply.created || '',
        last_update: reply.last_update || '',
        depth: reply.depth || 0,
        children: reply.children || 0,
        net_votes: reply.net_votes || 0,
        pending_payout_value: reply.pending_payout_value || '0.000 HBD',
        total_payout_value: reply.total_payout_value || '0.000 HBD',
        parent_author: reply.parent_author || '',
        parent_permlink: reply.parent_permlink || '',
        url: reply.url || `/@${reply.author}/${reply.permlink}`,
        root_author: reply.root_author || '',
        root_permlink: reply.root_permlink || '',
        root_title: reply.root_title || '',
        active_votes: reply.active_votes || [],
      };
    });

    // Sort comments by creation time (newest first)
    comments.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

    return comments;
  } catch (error) {
    if (error instanceof HiveError) {
      throw error;
    }
    throw new HiveError(
      `Failed to get comments: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Check if a post exists on Hive blockchain
 *
 * @param author - Username of the post author
 * @param permlink - Unique identifier of the post
 * @param client - Optional HiveClient instance for custom configuration
 * @returns Promise resolving to true if post exists, false otherwise
 *
 * @example
 * ```typescript
 * const exists = await postExists('alice', 'my-post-permlink');
 * if (exists) {
 *   console.log('Post already exists!');
 * }
 * ```
 */
export async function postExists(
  author: string,
  permlink: string,
  client?: HiveClient
): Promise<boolean> {
  try {
    const hiveClient = client || new HiveClient(createConfigFromEnv());

    // Validate input parameters
    if (!validateUsername(author)) {
      throw new HiveError('Invalid author username format');
    }

    if (!permlink || permlink.trim().length === 0) {
      throw new HiveError('Permlink cannot be empty');
    }

    // Try to get post content - if it exists, the call will return data
    const content = await hiveClient.getContent(author, permlink);

    // Post exists if content has an author (non-empty response)
    return !!(content && content.author);
  } catch (error) {
    // If there's an error (like post not found), it doesn't exist
    return false;
  }
}
