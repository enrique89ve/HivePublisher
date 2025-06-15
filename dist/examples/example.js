/**
 * Example usage of HiveTS library
 */
import { createPost, editPost, HiveClient } from '../src';
// Example function to demonstrate creating a post
async function exampleCreatePost() {
    console.log('🚀 Creating a new post...');
    // Setup credentials (use environment variables in production)
    const credentials = {
        username: process.env.HIVE_USERNAME || 'your-username',
        postingKey: process.env.HIVE_POSTING_KEY || 'your-posting-private-key'
    };
    // Define post content
    const postData = {
        title: 'Getting Started with HiveTS',
        body: `
# Welcome to HiveTS!

This post was created using the **HiveTS** library - a lightweight TypeScript solution for Hive blockchain operations.

## Features

- ✅ Easy post creation
- ✅ Post editing capabilities  
- ✅ Full TypeScript support
- ✅ Minimal dependencies
- ✅ Comprehensive error handling

## Code Example

\`\`\`typescript
import { createPost } from 'hivets';

const result = await createPost(credentials, {
  title: 'My Post',
  body: 'Hello Hive!',
  tags: ['hivets', 'typescript']
});
\`\`\`

Happy posting! 🎉
    `.trim(),
        tags: ['hivets', 'typescript', 'programming', 'blockchain', 'tutorial']
    };
    try {
        const result = await createPost(credentials, postData);
        if (result.success) {
            console.log('✅ Post created successfully!');
            console.log('📄 Transaction ID:', result.transaction_id);
            return result.transaction_id;
        }
        else {
            console.error('❌ Failed to create post:', result.error);
            return null;
        }
    }
    catch (error) {
        console.error('💥 Unexpected error:', error);
        return null;
    }
}
// Example function to demonstrate editing a post
async function exampleEditPost(permlink) {
    console.log('✏️ Editing post...');
    const credentials = {
        username: process.env.HIVE_USERNAME || 'your-username',
        postingKey: process.env.HIVE_POSTING_KEY || 'your-posting-private-key'
    };
    // Updated post content
    const updatedPostData = {
        title: 'Getting Started with HiveTS (Updated)',
        body: `
# Welcome to HiveTS! (Updated Version)

This post was created and **updated** using the **HiveTS** library - a lightweight TypeScript solution for Hive blockchain operations.

## New Features Added

- ✅ Easy post creation
- ✅ Post editing capabilities (NEW!)
- ✅ Full TypeScript support
- ✅ Minimal dependencies
- ✅ Comprehensive error handling
- ✅ Advanced validation (NEW!)

## Updated Code Example

\`\`\`typescript
import { createPost, editPost } from 'hivets';

// Create a post
const result = await createPost(credentials, postData);

// Edit the post
const editResult = await editPost(credentials, permlink, updatedData);
\`\`\`

## What's New

This update includes improved error handling and better validation for post content and metadata.

Happy posting and editing! 🎉✨
    `.trim(),
        tags: ['hivets', 'typescript', 'programming', 'blockchain', 'update']
    };
    try {
        const result = await editPost(credentials, permlink, updatedPostData);
        if (result.success) {
            console.log('✅ Post edited successfully!');
            console.log('📄 Transaction ID:', result.transaction_id);
        }
        else {
            console.error('❌ Failed to edit post:', result.error);
        }
    }
    catch (error) {
        console.error('💥 Unexpected error:', error);
    }
}
// Example function to demonstrate custom client configuration
async function exampleCustomClient() {
    console.log('🔧 Using custom Hive client...');
    // Create a custom client with different API node
    const customClient = new HiveClient({
        apiNode: 'https://anyx.io',
        timeout: 15000 // 15 second timeout
    });
    const credentials = {
        username: process.env.HIVE_USERNAME || 'your-username',
        postingKey: process.env.HIVE_POSTING_KEY || 'your-posting-private-key'
    };
    const postData = {
        title: 'Testing Custom Client',
        body: 'This post was created using a custom Hive client configuration.',
        tags: ['hivets', 'testing']
    };
    try {
        const result = await createPost(credentials, postData, customClient);
        if (result.success) {
            console.log('✅ Post created with custom client!');
            console.log('📄 Transaction ID:', result.transaction_id);
        }
        else {
            console.error('❌ Failed with custom client:', result.error);
        }
    }
    catch (error) {
        console.error('💥 Custom client error:', error);
    }
}
// Example function to demonstrate error handling
async function exampleErrorHandling() {
    console.log('🚨 Testing error handling...');
    // Invalid credentials for testing
    const invalidCredentials = {
        username: '', // Invalid empty username
        postingKey: 'invalid-key-format'
    };
    const postData = {
        title: '', // Invalid empty title
        body: 'Test body',
        tags: [] // Invalid empty tags
    };
    try {
        const result = await createPost(invalidCredentials, postData);
        if (!result.success) {
            console.log('✅ Error correctly caught:', result.error);
        }
    }
    catch (error) {
        console.log('✅ Exception correctly thrown:', error instanceof Error ? error.message : 'Unknown error');
    }
}
// Main example runner
async function runExamples() {
    console.log('🎯 HiveTS Library Examples\n');
    // Check if credentials are provided
    if (!process.env.HIVE_USERNAME || !process.env.HIVE_POSTING_KEY) {
        console.log('⚠️ Please set HIVE_USERNAME and HIVE_POSTING_KEY environment variables to run examples with real credentials.');
        console.log('📚 Running examples with placeholder credentials for demonstration...\n');
    }
    // Run error handling example (safe to run without real credentials)
    await exampleErrorHandling();
    console.log('');
    // Uncomment these examples if you have valid credentials:
    /*
    // Create a post
    const transactionId = await exampleCreatePost();
    console.log('');
  
    // Edit the post (if creation was successful)
    if (transactionId) {
      // Note: In practice, you'd extract the permlink from the post creation
      // For this example, we'd need to generate or know the permlink
      console.log('💡 To edit the post, you would need the permlink from the created post.');
      console.log('');
    }
  
    // Test custom client
    await exampleCustomClient();
    console.log('');
    */
    console.log('🏁 Examples completed!');
}
// Run examples if this file is executed directly
if (require.main === module) {
    runExamples().catch(console.error);
}
export { exampleCreatePost, exampleEditPost, exampleCustomClient, exampleErrorHandling, runExamples };
//# sourceMappingURL=example.js.map