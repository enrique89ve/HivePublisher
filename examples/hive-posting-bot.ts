/**
 * Hive Posting Bot Example
 * 
 * A complete example bot that automatically publishes posts to the Hive blockchain
 * using the HiveTS library. Supports scheduled posting, content templates, and
 * automatic tag management.
 */

import { createPost, upvote, getAccountInfo, HiveClient, HiveCredentials, PostMetadata } from '../src/index.js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface BotConfig {
  credentials: HiveCredentials;
  defaultTags: string[];
  postingInterval: number; // minutes
  autoVoteOwnPosts: boolean;
  voteWeight: number;
  client?: HiveClient;
}

interface PostTemplate {
  title: string;
  body: string;
  tags?: string[];
  description?: string;
  image?: string;
}

export class HivePostingBot {
  private config: BotConfig;
  private client: HiveClient;
  private isRunning: boolean = false;
  private postQueue: PostTemplate[] = [];

  constructor(config: BotConfig) {
    this.config = config;
    this.client = config.client || new HiveClient({ mainnet: true });
    
    console.log(`🤖 Hive Posting Bot initialized for @${config.credentials.username}`);
    console.log(`📊 Posting interval: ${config.postingInterval} minutes`);
    console.log(`🏷️ Default tags: ${config.defaultTags.join(', ')}`);
  }

  /**
   * Start the bot - begins processing the post queue
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️ Bot is already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting Hive Posting Bot...');

    // Verify account exists and credentials work
    try {
      const account = await getAccountInfo(this.config.credentials.username, this.client);
      if (!account) {
        throw new Error('Account not found');
      }
      console.log(`✅ Account verified: @${account.name} (${account.reputation} reputation)`);
    } catch (error) {
      console.error('❌ Failed to verify account:', error instanceof Error ? error.message : 'Unknown error');
      this.isRunning = false;
      return;
    }

    // Start processing queue
    this.processQueue();
  }

  /**
   * Stop the bot
   */
  stop(): void {
    this.isRunning = false;
    console.log('🛑 Hive Posting Bot stopped');
  }

  /**
   * Add a post to the queue
   */
  addPost(post: PostTemplate): void {
    this.postQueue.push(post);
    console.log(`📝 Added post to queue: "${post.title}" (${this.postQueue.length} posts in queue)`);
  }

  /**
   * Add multiple posts from a JSON file
   */
  loadPostsFromFile(filePath: string): void {
    try {
      if (!existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const fileContent = readFileSync(filePath, 'utf8');
      const posts: PostTemplate[] = JSON.parse(fileContent);

      posts.forEach(post => this.addPost(post));
      console.log(`📁 Loaded ${posts.length} posts from ${filePath}`);
    } catch (error) {
      console.error('❌ Failed to load posts from file:', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Create a post immediately (bypass queue)
   */
  async publishPost(post: PostTemplate): Promise<boolean> {
    try {
      console.log(`📤 Publishing post: "${post.title}"`);

      // Prepare post metadata
      const metadata: PostMetadata = {
        title: post.title,
        body: post.body,
        tags: [...(post.tags || []), ...this.config.defaultTags].slice(0, 10), // Max 10 tags
        description: post.description,
        image: post.image
      };

      // Create the post
      const result = await createPost(this.config.credentials, metadata, this.client);

      if (result.success) {
        console.log(`✅ Post published successfully!`);
        console.log(`🔗 Transaction ID: ${result.transaction_id}`);
        console.log(`📄 Permlink: ${result.permlink}`);

        // Auto-vote if enabled
        if (this.config.autoVoteOwnPosts && result.permlink) {
          await this.autoVotePost(result.permlink);
        }

        return true;
      } else {
        console.error(`❌ Failed to publish post: ${result.error}`);
        return false;
      }
    } catch (error) {
      console.error('❌ Error publishing post:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  /**
   * Auto-vote own post
   */
  private async autoVotePost(permlink: string): Promise<void> {
    try {
      console.log(`🗳️ Auto-voting post with ${this.config.voteWeight}% weight...`);

      const voteResult = await upvote(
        this.config.credentials,
        this.config.credentials.username,
        permlink,
        this.config.voteWeight,
        this.client
      );

      if (voteResult.success) {
        console.log(`✅ Auto-vote successful: ${voteResult.transaction_id}`);
      } else {
        console.error(`❌ Auto-vote failed: ${voteResult.error}`);
      }
    } catch (error) {
      console.error('❌ Error auto-voting:', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Process the post queue
   */
  private async processQueue(): Promise<void> {
    while (this.isRunning) {
      if (this.postQueue.length === 0) {
        console.log('⏳ Queue empty, waiting for posts...');
        await this.sleep(60000); // Check every minute
        continue;
      }

      const post = this.postQueue.shift()!;
      console.log(`🔄 Processing post from queue: "${post.title}"`);

      const success = await this.publishPost(post);

      if (success) {
        console.log(`⏰ Waiting ${this.config.postingInterval} minutes before next post...`);
        await this.sleep(this.config.postingInterval * 60 * 1000);
      } else {
        // If failed, wait a shorter time before retrying
        console.log('⏰ Post failed, waiting 5 minutes before retrying...');
        this.postQueue.unshift(post); // Put it back at the front
        await this.sleep(5 * 60 * 1000);
      }
    }
  }

  /**
   * Get queue status
   */
  getStatus(): { isRunning: boolean; queueLength: number; account: string } {
    return {
      isRunning: this.isRunning,
      queueLength: this.postQueue.length,
      account: this.config.credentials.username
    };
  }

  /**
   * Clear the post queue
   */
  clearQueue(): void {
    const clearedCount = this.postQueue.length;
    this.postQueue = [];
    console.log(`🗑️ Cleared ${clearedCount} posts from queue`);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Example usage and demo
async function runBotDemo(): Promise<void> {
  console.log('🎯 Hive Posting Bot Demo');
  console.log('========================');

  // Bot configuration
  const config: BotConfig = {
    credentials: {
      username: process.env.HIVE_USERNAME || 'your-username',
      postingKey: process.env.HIVE_POSTING_KEY || 'your-posting-key'
    },
    defaultTags: ['hivets', 'automated', 'bot'],
    postingInterval: 60, // 1 hour between posts
    autoVoteOwnPosts: true,
    voteWeight: 100 // 100% upvote
  };

  // Check if credentials are provided
  if (!config.credentials.username || config.credentials.username === 'your-username' ||
      !config.credentials.postingKey || config.credentials.postingKey === 'your-posting-key') {
    console.log('⚠️ Please set HIVE_USERNAME and HIVE_POSTING_KEY environment variables');
    console.log('Example:');
    console.log('export HIVE_USERNAME=your-username');
    console.log('export HIVE_POSTING_KEY=your-posting-key');
    return;
  }

  // Create bot instance
  const bot = new HivePostingBot(config);

  // Add sample posts to queue
  bot.addPost({
    title: 'Hello from HiveTS Bot!',
    body: `# Hello Hive Community!

This post was automatically published using the HiveTS library and a custom posting bot.

## Features

- ✅ Automated posting with queue management
- ✅ Customizable posting intervals
- ✅ Auto-voting on published posts
- ✅ Template-based content
- ✅ Tag management

## Built with HiveTS

The HiveTS library makes it easy to interact with the Hive blockchain using TypeScript. 

**Posted at:** ${new Date().toISOString()}

---
*This is an automated post generated by HiveTS Bot*`,
    tags: ['introduction', 'automation', 'typescript'],
    description: 'Automated post from HiveTS library bot demonstration'
  });

  bot.addPost({
    title: 'Daily Update from HiveTS Bot',
    body: `# Daily Hive Update

## Today's Highlights

📊 **Blockchain Stats:**
- Current time: ${new Date().toLocaleString()}
- Posted via: HiveTS Library v1.0.0
- Bot status: Active and running

## About This Bot

This bot demonstrates the capabilities of the HiveTS library for automated Hive blockchain interactions.

### Key Features:
1. Queue-based posting system
2. Automatic retry on failures
3. Configurable posting intervals
4. Template support
5. Auto-voting capabilities

Stay tuned for more automated content!

---
*Powered by HiveTS - TypeScript for Hive Blockchain*`,
    tags: ['daily', 'update', 'blockchain'],
    description: 'Daily automated update post'
  });

  try {
    // Start the bot
    await bot.start();

    // Let it run for demonstration (in production, this would run indefinitely)
    console.log('🔄 Bot is running... Press Ctrl+C to stop');
    
    // Keep the process alive
    process.on('SIGINT', () => {
      console.log('\n🛑 Received interrupt signal, stopping bot...');
      bot.stop();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Bot failed to start:', error instanceof Error ? error.message : 'Unknown error');
  }
}

// Run demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runBotDemo().catch(console.error);
}

export { runBotDemo };