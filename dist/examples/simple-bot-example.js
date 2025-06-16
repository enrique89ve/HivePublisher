/**
 * Simple Hive Bot Example
 *
 * A minimal example showing how to use the HivePostingBot
 * for automated content publishing on Hive blockchain
 */
import { HivePostingBot } from './hive-posting-bot.js';
async function runSimpleBot() {
    console.log('🤖 Starting Simple Hive Bot Example');
    // Check for required credentials
    const username = process.env.HIVE_USERNAME;
    const postingKey = process.env.HIVE_POSTING_KEY;
    if (!username || !postingKey) {
        console.log('❌ Missing credentials. Please set environment variables:');
        console.log('   export HIVE_USERNAME="your-username"');
        console.log('   export HIVE_POSTING_KEY="your-posting-key"');
        return;
    }
    // Create bot with basic configuration
    const bot = new HivePostingBot({
        credentials: { username, postingKey },
        defaultTags: ['hivets', 'automated', 'demo'],
        postingInterval: 360, // 6 hours between posts
        autoVoteOwnPosts: true,
        voteWeight: 100
    });
    // Add sample posts to the queue
    console.log('📝 Adding posts to queue...');
    bot.addPost({
        title: 'Welcome to Automated Posting with HiveTS',
        body: `# Hello Hive Community!

This post was automatically created and published using the HiveTS library.

## About This Bot

This demonstration shows how easy it is to automate content publishing on the Hive blockchain using TypeScript.

### Key Features:
- ✅ Queue-based posting system
- ✅ Automatic retry on failures  
- ✅ Smart interval management
- ✅ Auto-voting capabilities
- ✅ Template support

## Technical Details

**Library**: HiveTS v1.0.0
**Language**: TypeScript
**Published**: ${new Date().toISOString()}
**Blockchain**: Hive

## Next Steps

This bot will continue to publish content from its queue, respecting Hive's posting intervals and community guidelines.

---
*This is an automated post created with the HiveTS library*`,
        tags: ['introduction', 'automation', 'typescript'],
        description: 'Introduction to automated posting with HiveTS library'
    });
    bot.addPost({
        title: 'Building on Hive: A Developer\'s Perspective',
        body: `# Why Build on Hive?

As a developer exploring blockchain platforms, Hive offers unique advantages:

## Technical Benefits

### No Gas Fees
Unlike Ethereum or other blockchains, Hive uses Resource Credits instead of gas fees, making it accessible for users.

### Fast Transactions
With 3-second block times, Hive provides near-instant transaction confirmation.

### Rich APIs
Multiple API endpoints provide comprehensive blockchain data access.

## Development Experience

### TypeScript Support
The HiveTS library brings type safety and modern development practices to Hive development.

\`\`\`typescript
import { createPost, upvote, getAccountInfo } from 'hivets';

// Create a post
const result = await createPost(credentials, {
  title: 'My Post',
  body: 'Content here...',
  tags: ['development']
});

// Upvote content
await upvote(credentials, 'author', 'permlink', 100);
\`\`\`

### Enterprise Features
- Node failover and health monitoring
- Request/response interceptors
- Automatic retry logic
- Comprehensive error handling

## Community

The Hive developer community is active and supportive, with regular updates and improvements to the ecosystem.

## Conclusion

Hive provides a solid foundation for building decentralized applications with real-world utility.

---
*Generated automatically by HiveTS Bot*`,
        tags: ['development', 'hive', 'blockchain', 'tutorial'],
        description: 'Developer perspective on building applications on Hive blockchain'
    });
    // Load additional posts from template file if it exists
    try {
        bot.loadPostsFromFile('./examples/posts-template.json');
    }
    catch (error) {
        console.log('ℹ️ Template file not found, using default posts only');
    }
    // Show initial status
    const initialStatus = bot.getStatus();
    console.log(`📊 Initial Status:`);
    console.log(`   Account: @${initialStatus.account}`);
    console.log(`   Queue Length: ${initialStatus.queueLength} posts`);
    console.log(`   Bot Running: ${initialStatus.isRunning}`);
    try {
        // Start the bot
        console.log('🚀 Starting bot...');
        await bot.start();
        // Set up graceful shutdown
        process.on('SIGINT', () => {
            console.log('\n🛑 Shutting down bot gracefully...');
            bot.stop();
            const finalStatus = bot.getStatus();
            console.log(`📊 Final Status:`);
            console.log(`   Posts Remaining: ${finalStatus.queueLength}`);
            console.log(`   Bot Running: ${finalStatus.isRunning}`);
            console.log('✅ Bot stopped successfully');
            process.exit(0);
        });
        // Keep the process alive
        console.log('🔄 Bot is running... Press Ctrl+C to stop');
        console.log('ℹ️ Monitor the console for posting updates');
    }
    catch (error) {
        console.error('❌ Failed to start bot:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
    }
}
// Run the example
if (import.meta.url === `file://${process.argv[1]}`) {
    runSimpleBot().catch(error => {
        console.error('❌ Example failed:', error.message);
        process.exit(1);
    });
}
export { runSimpleBot };
//# sourceMappingURL=simple-bot-example.js.map