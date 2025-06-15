/**
 * Comprehensive demonstration of HiveTS library functionality
 * Shows all core operations with real blockchain interactions
 */

import { 
  HiveClient, 
  createPost, 
  editPost, 
  upvote, 
  getAccountInfo,
  HiveCredentials,
  PostMetadata 
} from '../src/index.js';

async function comprehensiveDemo() {
  console.log('🎯 HiveTS - Comprehensive Library Demo\n');

  const username = process.env.HIVE_USERNAME || 'demo-user';
  const postingKey = process.env.HIVE_POSTING_KEY || 'demo-key';

  // Demo 1: Account Information Retrieval
  console.log('📊 Demo 1: Account Information');
  try {
    const accountInfo = await getAccountInfo('mahdiyari');
    if (accountInfo) {
      console.log(`✅ Account: @${accountInfo.name}`);
      console.log(`   Reputation: ${accountInfo.reputation}`);
      console.log(`   Posts: ${accountInfo.total_posts}`);
      console.log(`   Created: ${accountInfo.created_at}`);
    }
  } catch (error) {
    console.log(`❌ Account retrieval failed: ${error}`);
  }

  if (username === 'demo-user' || postingKey === 'demo-key') {
    console.log('\n⚠️  Demo mode: Using test credentials');
    console.log('💡 Set HIVE_USERNAME and HIVE_POSTING_KEY environment variables for live operations\n');
    
    console.log('📋 Available Operations:');
    console.log('• getAccountInfo() - Retrieve user data and statistics');
    console.log('• createPost() - Publish new content to blockchain');
    console.log('• editPost() - Modify existing posts');
    console.log('• upvote() - Vote on content with customizable weight');
    console.log('\n🔧 Client Features:');
    console.log('• Configurable API endpoints');
    console.log('• Automatic retry and timeout handling');
    console.log('• Comprehensive error reporting');
    console.log('• TypeScript type safety');
    return;
  }

  console.log('\n🔑 Live Demo: Using real credentials\n');

  const credentials: HiveCredentials = {
    username,
    postingKey
  };

  // Demo 2: Custom Client Configuration
  console.log('🔧 Demo 2: Custom Client Configuration');
  const customClient = new HiveClient({
    apiNode: 'https://rpc.mahdiyari.info',
    timeout: 15000
  });

  try {
    const testAccount = await customClient.getAccount(username);
    console.log(`✅ Custom client working: Account ${testAccount.name} found`);
  } catch (error) {
    console.log(`❌ Custom client failed: ${error}`);
  }

  // Demo 3: Content Publishing
  console.log('\n📝 Demo 3: Content Publishing');
  const postData: PostMetadata = {
    title: `HiveTS Demo - ${new Date().toISOString()}`,
    body: `# HiveTS Library Demonstration

This post was created using the HiveTS TypeScript library to demonstrate:

## Core Features
- ✅ TypeScript-first development
- ✅ Minimal dependencies  
- ✅ Production-ready operations
- ✅ Comprehensive error handling

## Operations Tested
1. Account information retrieval
2. Post creation with this content
3. Post editing capabilities
4. Voting functionality

Generated at: ${new Date().toISOString()}

---
*Created with [HiveTS](https://github.com/hivets/hivets)*`,
    tags: ['hivets', 'typescript', 'blockchain', 'demo']
  };

  try {
    const postResult = await createPost(credentials, postData, customClient);
    if (postResult.success) {
      console.log(`✅ Post created successfully`);
      console.log(`   Transaction: ${postResult.transaction_id}`);
      
      // Demo 4: Content Editing
      console.log('\n✏️ Demo 4: Content Editing');
      const permlink = generateDemoPermlink(postData.title);
      
      // Wait a moment to avoid edit interval limits
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      const updatedPost: PostMetadata = {
        ...postData,
        body: postData.body + '\n\n**EDIT**: Post updated via HiveTS editPost() function!'
      };

      const editResult = await editPost(credentials, permlink, updatedPost, customClient);
      if (editResult.success) {
        console.log(`✅ Post edited successfully`);
        console.log(`   Transaction: ${editResult.transaction_id}`);
      } else {
        console.log(`⚠️  Edit result: ${editResult.error}`);
      }

      // Demo 5: Voting
      console.log('\n👍 Demo 5: Voting');
      
      // Wait to avoid voting interval limits
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      const voteResult = await upvote(credentials, username, permlink, 100, customClient);
      if (voteResult.success) {
        console.log(`✅ Vote cast successfully`);
        console.log(`   Transaction: ${voteResult.transaction_id}`);
      } else {
        console.log(`⚠️  Vote result: ${voteResult.error}`);
      }

    } else {
      console.log(`⚠️  Post creation: ${postResult.error}`);
    }
  } catch (error) {
    console.log(`❌ Publishing demo failed: ${error}`);
  }

  console.log('\n🏁 Comprehensive demo completed');
  console.log('\n📖 Summary:');
  console.log('• All core HiveTS operations demonstrated');
  console.log('• Real blockchain transactions executed');
  console.log('• Error handling patterns shown');
  console.log('• Custom client configuration used');
  console.log('• TypeScript type safety maintained');
}

function generateDemoPermlink(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  comprehensiveDemo().catch(console.error);
}

export { comprehensiveDemo };