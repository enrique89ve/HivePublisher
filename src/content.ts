/**
 * Hive blockchain content operations for posts and comments
 */

import { HiveClient } from './hive-client.js';
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
    const hiveClient = client || new HiveClient();
    
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
      parent_author: content.parent_author || '',
      parent_permlink: content.parent_permlink || '',
      json_metadata: jsonMetadata,
      created: content.created || '',
      last_update: content.last_update || '',
      depth: content.depth || 0,
      children: content.children || 0,
      net_rshares: content.net_rshares || '0',
      abs_rshares: content.abs_rshares || '0',
      vote_rshares: content.vote_rshares || '0',
      children_abs_rshares: content.children_abs_rshares || '0',
      cashout_time: content.cashout_time || '',
      max_cashout_time: content.max_cashout_time || '',
      total_vote_weight: content.total_vote_weight || '0',
      reward_weight: content.reward_weight || 10000,
      total_payout_value: content.total_payout_value || '0.000 HBD',
      curator_payout_value: content.curator_payout_value || '0.000 HBD',
      author_rewards: content.author_rewards || 0,
      net_votes: content.net_votes || 0,
      root_comment: content.root_comment || content.id || 0,
      max_accepted_payout: content.max_accepted_payout || '1000000.000 HBD',
      percent_hbd: content.percent_hbd || 10000,
      allow_replies: content.allow_replies !== false,
      allow_votes: content.allow_votes !== false,
      allow_curation_rewards: content.allow_curation_rewards !== false,
      beneficiaries: content.beneficiaries || [],
      url: content.url || `/@${author}/${permlink}`,
      root_title: content.root_title || content.title || '',
      pending_payout_value: content.pending_payout_value || '0.000 HBD',
      total_pending_payout_value: content.total_pending_payout_value || '0.000 HBD',
      active_votes: content.active_votes || [],
      replies: content.replies || [],
      author_reputation: content.author_reputation || '0',
      promoted: content.promoted || '0.000 HBD',
      body_length: content.body_length || 0,
      reblogged_by: content.reblogged_by || []
    };
    
    return postContent;
    
  } catch (error) {
    if (error instanceof HiveError) {
      throw error;
    }
    throw new HiveError(`Failed to get post content: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    const hiveClient = client || new HiveClient();
    
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
        parent_author: reply.parent_author || '',
        parent_permlink: reply.parent_permlink || '',
        title: reply.title || '',
        body: reply.body || '',
        json_metadata: jsonMetadata,
        created: reply.created || '',
        last_update: reply.last_update || '',
        depth: reply.depth || 0,
        children: reply.children || 0,
        net_votes: reply.net_votes || 0,
        total_payout_value: reply.total_payout_value || '0.000 HBD',
        pending_payout_value: reply.pending_payout_value || '0.000 HBD',
        author_reputation: reply.author_reputation || '0',
        active_votes: reply.active_votes || [],
        replies: reply.replies || [],
        cashout_time: reply.cashout_time || '',
        url: reply.url || `/@${reply.author}/${reply.permlink}`
      };
    });
    
    // Sort comments by creation time (newest first)
    comments.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
    
    return comments;
    
  } catch (error) {
    if (error instanceof HiveError) {
      throw error;
    }
    throw new HiveError(`Failed to get comments: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}