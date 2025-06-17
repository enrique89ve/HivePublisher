/**
 * Basic Post Creation Example
 *
 * This example shows how to create a new post on Hive blockchain.
 */

import { createPost } from 'hive-publisher';

async function basicPostCreation() {
  try {
    const result = await createPost({
      title: 'My First Post',
      body: 'Hello Hive! This is my first post using HivePublisher.',
      tags: ['introduction', 'hive', 'blockchain'],
    });

    if (result.success) {
      console.log('✅ Post created successfully!');
      console.log('Transaction ID:', result.transaction_id);
      console.log('Permlink:', result.permlink);
    } else {
      console.log('❌ Failed to create post:', result.error);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the example
basicPostCreation();
