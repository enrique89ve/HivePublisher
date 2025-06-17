/**
 * Custom Configuration Example
 *
 * This example shows how to use custom configuration and client settings.
 */

import { HiveClient, createPost } from 'hive-publisher';

async function customConfigExample() {
  try {
    // Create custom client with specific settings
    const customClient = new HiveClient({
      apiNode: 'https://api.openhive.network',
      testnet: false,
      timeout: 15000,
      maxRetries: 5,
    });

    // Use custom credentials
    const credentials = {
      username: 'your-username',
      postingKey: 'your-posting-key',
    };

    // Create post with custom client
    const result = await createPost(
      credentials,
      {
        title: 'Post with Custom Config',
        body: 'This post was created using custom configuration.',
        tags: ['custom', 'config'],
      },
      customClient
    );

    console.log('✅ Custom configuration example completed');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the example
customConfigExample();
