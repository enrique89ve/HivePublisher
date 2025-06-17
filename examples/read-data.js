/**
 * Data Reading Example
 *
 * This example shows how to read account info and post content.
 */

import { getAccountInfo, getPostContent } from 'hive-publisher';

async function readDataExample() {
  try {
    // Get account information
    const account = await getAccountInfo('hiveio');
    console.log('Account Info:');
    console.log('- Balance:', account.balance);
    console.log('- Reputation:', account.reputation);
    console.log('- Post Count:', account.post_count);

    // Get post content
    const post = await getPostContent('hiveio', 'hello-world');
    console.log('\nPost Content:');
    console.log('- Title:', post.title);
    console.log('- Author:', post.author);
    console.log('- Created:', post.created);
    console.log('- Votes:', post.net_votes);

    console.log('✅ Data reading examples completed');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the example
readDataExample();
