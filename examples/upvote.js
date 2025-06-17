/**
 * Upvoting Example
 *
 * This example shows how to upvote posts and comments.
 */

import { upvote } from 'hive-publisher';

async function upvoteExample() {
  try {
    // Upvote a post with 100% weight
    const fullUpvote = await upvote('author', 'post-permlink', 100);

    // Upvote a post with 50% weight
    const halfUpvote = await upvote('author', 'post-permlink', 50);

    // Upvote with default weight (100%)
    const defaultUpvote = await upvote('author', 'post-permlink');

    console.log('✅ Upvoting examples completed');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the example
upvoteExample();
