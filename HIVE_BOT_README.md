# Hive Posting Bot - Automated Content Publishing

A complete TypeScript bot for automated content publishing on the Hive blockchain using the HiveTS library.

## Features

- **Queue-based posting system** - Schedule multiple posts with automatic intervals
- **Smart retry logic** - Handles Hive posting limits and network errors
- **Auto-voting** - Automatically upvote your published posts
- **Template support** - Load posts from JSON files
- **Real-time monitoring** - Track bot status and queue progress
- **Error handling** - Comprehensive error recovery and logging
- **Configurable intervals** - Set custom posting schedules

## Installation

### Prerequisites

- Node.js 18+ with TypeScript support
- Hive account with posting key
- Basic knowledge of Hive blockchain

### Setup Steps

1. **Clone or download the HiveTS library:**
```bash
git clone <repository-url>
cd hivets-library
```

2. **Install dependencies:**
```bash
npm install
```

3. **Compile TypeScript:**
```bash
npx tsc
```

4. **Set up environment variables:**
```bash
export HIVE_USERNAME="your-hive-username"
export HIVE_POSTING_KEY="your-posting-private-key"
```

### Getting Your Hive Credentials

1. **Username**: Your Hive account name (e.g., @alice)
2. **Posting Key**: Your private posting key from your Hive wallet
   - **WARNING**: Never share your private keys
   - Use environment variables, never hardcode keys
   - Consider using a dedicated posting account

## Quick Start

### Basic Bot Usage

```typescript
import { HivePostingBot } from './examples/hive-posting-bot.js';

// Configure the bot
const bot = new HivePostingBot({
  credentials: {
    username: process.env.HIVE_USERNAME!,
    postingKey: process.env.HIVE_POSTING_KEY!
  },
  defaultTags: ['automated', 'bot', 'hivets'],
  postingInterval: 60, // 60 minutes between posts
  autoVoteOwnPosts: true,
  voteWeight: 100 // 100% upvote
});

// Add posts to queue
bot.addPost({
  title: 'Hello Hive!',
  body: 'This is my first automated post.',
  tags: ['introduction']
});

// Start the bot
await bot.start();
```

### Using Post Templates

Create a `posts.json` file:

```json
[
  {
    "title": "Daily Update",
    "body": "# Today's Highlights\n\nSharing my daily thoughts...",
    "tags": ["daily", "blog"],
    "description": "Daily blog post"
  }
]
```

Load and use templates:

```typescript
// Load posts from file
bot.loadPostsFromFile('./posts.json');

// Start publishing
await bot.start();
```

## Configuration Options

### Bot Configuration

```typescript
interface BotConfig {
  credentials: {
    username: string;    // Your Hive username
    postingKey: string;  // Your posting private key
  };
  defaultTags: string[];        // Tags added to all posts
  postingInterval: number;      // Minutes between posts
  autoVoteOwnPosts: boolean;    // Auto-upvote published posts
  voteWeight: number;           // Vote weight (0-100)
  client?: HiveClient;          // Custom Hive client
}
```

### Post Template Format

```typescript
interface PostTemplate {
  title: string;        // Post title
  body: string;         // Post content (Markdown supported)
  tags?: string[];      // Post-specific tags
  description?: string; // SEO description
  image?: string;       // Featured image URL
}
```

## Running the Bot

### Command Line Usage

1. **Set environment variables:**
```bash
export HIVE_USERNAME="your-username"
export HIVE_POSTING_KEY="your-posting-key"
```

2. **Run the bot:**
```bash
node dist/examples/hive-posting-bot.js
```

3. **Stop the bot:**
Press `Ctrl+C` to stop gracefully

### Programmatic Usage

```typescript
import { HivePostingBot } from './examples/hive-posting-bot.js';

const bot = new HivePostingBot({
  credentials: {
    username: process.env.HIVE_USERNAME!,
    postingKey: process.env.HIVE_POSTING_KEY!
  },
  defaultTags: ['automated'],
  postingInterval: 120, // 2 hours
  autoVoteOwnPosts: true,
  voteWeight: 75
});

// Add single post
bot.addPost({
  title: 'My Automated Post',
  body: 'Content goes here...',
  tags: ['blog']
});

// Load from file
bot.loadPostsFromFile('./my-posts.json');

// Start bot
await bot.start();

// Check status
const status = bot.getStatus();
console.log(`Running: ${status.isRunning}`);
console.log(`Queue: ${status.queueLength} posts`);

// Stop when done
bot.stop();
```

## Bot Management

### Monitor Bot Status

```typescript
// Get current status
const status = bot.getStatus();
console.log(`Bot running: ${status.isRunning}`);
console.log(`Posts in queue: ${status.queueLength}`);
console.log(`Account: ${status.account}`);
```

### Queue Management

```typescript
// Add single post
bot.addPost({
  title: 'New Post',
  body: 'Content...',
  tags: ['news']
});

// Load from JSON file
bot.loadPostsFromFile('./posts.json');

// Clear queue
bot.clearQueue();

// Publish immediately (bypass queue)
await bot.publishPost({
  title: 'Urgent Post',
  body: 'Important content...',
  tags: ['urgent']
});
```

## Example Posts JSON

Create `example-posts.json`:

```json
[
  {
    "title": "Introduction to Hive Blockchain",
    "body": "# Welcome to Hive\n\nHive is a decentralized social media platform...\n\n## Key Features\n- Decentralized\n- Fast transactions\n- Community-driven\n\nJoin the revolution!",
    "tags": ["hive", "blockchain", "introduction"],
    "description": "Introduction to Hive blockchain platform"
  },
  {
    "title": "Building on Hive with TypeScript",
    "body": "# Developer Guide\n\n## Getting Started\n\nHive offers powerful APIs for developers...\n\n```typescript\nimport { createPost } from 'hivets';\n\nconst result = await createPost(credentials, metadata);\n```\n\n## Next Steps\n- Explore the documentation\n- Join developer communities\n- Build amazing dApps",
    "tags": ["development", "typescript", "tutorial"],
    "description": "Guide for building on Hive with TypeScript"
  }
]
```

## Important Guidelines

### Hive Blockchain Rules

1. **Posting Limits**: Hive allows one post every 5 minutes
2. **Quality Content**: Focus on valuable, original content
3. **Community Guidelines**: Follow Hive community standards
4. **Tag Limits**: Maximum 10 tags per post
5. **Engagement**: Respond to comments and engage with others

### Bot Best Practices

1. **Content Quality**: Even automated content should provide value
2. **Transparency**: Let readers know content is automated
3. **Moderation**: Monitor your bot's output regularly
4. **Respect Limits**: Don't spam the blockchain
5. **Security**: Keep private keys secure and use environment variables

### Error Handling

The bot handles common scenarios:

- **Network errors**: Automatic retry with backoff
- **Posting limits**: Respects 5-minute intervals
- **Invalid content**: Validates posts before publishing
- **Account issues**: Verifies credentials on startup
- **Node failures**: Uses HiveTS failover mechanisms

## Troubleshooting

### Common Issues

**Bot won't start:**
- Check your credentials are correct
- Verify environment variables are set
- Ensure account exists and has posting authority

**Posts fail to publish:**
- Check posting interval (minimum 5 minutes)
- Verify content meets Hive requirements
- Check network connectivity

**Auto-voting fails:**
- Ensure you have voting power
- Check vote weight is between 0-100
- Verify posting key has voting permissions

### Debug Mode

Enable debug logging:

```typescript
const bot = new HivePostingBot({
  // ... config
});

// Monitor all operations
bot.on('post_published', (result) => {
  console.log('Published:', result.transaction_id);
});

bot.on('error', (error) => {
  console.error('Bot error:', error.message);
});
```

## Security Considerations

### Private Key Safety

1. **Never hardcode** private keys in source code
2. **Use environment variables** for credentials
3. **Consider dedicated accounts** for automated posting
4. **Regular key rotation** for enhanced security
5. **Monitor account activity** for unauthorized access

### Environment Variables

```bash
# .env file (never commit to git)
HIVE_USERNAME=your-username
HIVE_POSTING_KEY=your-posting-private-key

# Load in your application
require('dotenv').config();
```

## Advanced Usage

### Custom Hive Client

```typescript
import { HiveClient } from 'hivets';

const customClient = new HiveClient({
  apiNode: 'https://api.hive.blog',
  fallbackNodes: ['https://anyx.io'],
  timeout: 15000,
  maxRetries: 5
});

const bot = new HivePostingBot({
  credentials: { username, postingKey },
  defaultTags: ['custom'],
  postingInterval: 30,
  client: customClient
});
```

### Scheduling with Cron

```bash
# Run bot every hour
0 * * * * /usr/bin/node /path/to/bot/dist/examples/hive-posting-bot.js

# Run bot daily at 9 AM
0 9 * * * /usr/bin/node /path/to/bot/dist/examples/hive-posting-bot.js
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

- **Documentation**: [HiveTS Library Docs](./README.md)
- **Hive Community**: Join @hive-dev on Discord
- **Issues**: Report bugs via GitHub Issues
- **Examples**: Check the examples/ directory for more use cases

## Disclaimer

This bot interacts with the Hive blockchain using real cryptocurrency transactions. Use responsibly and ensure you understand the implications of automated posting. Always test with small amounts first and monitor your bot's behavior.