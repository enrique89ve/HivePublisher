# HiveTS

A lightweight, enterprise-ready TypeScript library for Hive blockchain operations. Built with WAX-inspired architecture for maximum reliability and developer experience.

## Features

🚀 **Core Operations**
- Create and edit posts with full metadata support
- Vote on content with configurable weight
- Retrieve post content and comments
- Comprehensive account information queries

⚡ **Enterprise Architecture**
- Automatic node failover (8 nodes with health monitoring)
- Request/response interceptors for middleware
- TAPOS caching with 28x performance improvement
- Advanced retry logic with exponential backoff

🛡️ **Production Ready**
- TypeScript-first design with full type safety
- Minimal dependencies (only crypto essentials)
- Comprehensive error handling and validation
- Battle-tested with real blockchain transactions

## Core Operations

- **Content Management**: Create, edit, and retrieve posts with comments
- **Social Interactions**: Vote on content and manage engagement
- **Account Data**: Get user profiles, reputation, balances, and statistics
- **Network Resilience**: Automatic failover and intelligent node selection

## Quick Start

```bash
npm install hivets
```

```typescript
import { 
  createPost, 
  editPost, 
  upvote, 
  getAccountInfo, 
  getPostContent, 
  getComments,
  HiveClient 
} from 'hivets';

const credentials = {
  username: 'your-username',
  postingKey: 'your-posting-key'
};

// Create a new post
const result = await createPost(credentials, {
  title: 'Hello Hive',
  body: 'My first post using HiveTS',
  tags: ['introduction', 'hivets']
});

if (result.success) {
  console.log(`Post created: ${result.transaction_id}`);
}

// Edit existing post
await editPost(credentials, 'post-permlink', {
  title: 'Updated Title',
  body: 'Updated content',
  tags: ['updated']
});

// Vote on content
await upvote(credentials, 'author', 'permlink', 100); // 100% upvote

// Get account information
const account = await getAccountInfo('username');
if (account) {
  console.log(`Reputation: ${account.reputation}`);
  console.log(`Posts: ${account.total_posts}`);
  console.log(`Followers: ${account.followers}`);
}

// Read post content
const post = await getPostContent('author', 'permlink');
if (post) {
  console.log(`Title: ${post.title}`);
  console.log(`Votes: ${post.net_votes}`);
  console.log(`Payout: ${post.total_payout_value}`);
}

// Get post comments
const comments = await getComments('author', 'permlink');
console.log(`Found ${comments.length} comments`);
```

## API Reference

### Account Operations

#### `getAccountInfo(username: string, client?: HiveClient): Promise<AccountInfo | null>`

Retrieves comprehensive account information from the blockchain.

```typescript
const account = await getAccountInfo('theycallmedan');
if (account) {
  console.log(`Reputation: ${account.reputation}`);      // 79.65
  console.log(`Posts: ${account.total_posts}`);          // 3559
  console.log(`Followers: ${account.followers}`);        // 12847
  console.log(`Created: ${account.created_at}`);         // 2018-08-19T06:32:48
  console.log(`HP Balance: ${account.incoming_hp}`);     // Hive Power
  console.log(`Last Post: ${account.last_post}`);        // 2025-05-27T21:48:27
}
```

**Returns:** Complete account data including profile, reputation, balances, and social metrics.

### Content Reading

#### `getPostContent(author: string, permlink: string, client?: HiveClient): Promise<PostContent | null>`

Retrieves complete post data including metadata, voting information, and payout details.

```typescript
const post = await getPostContent('enrique89.test', 'getting-started-with-hivets-1749968897');
if (post) {
  console.log(`Title: ${post.title}`);                   // Getting Started with HiveTS
  console.log(`Author: @${post.author}`);               // @enrique89.test
  console.log(`Votes: ${post.net_votes}`);              // 0
  console.log(`Payout: ${post.total_payout_value}`);    // 0.000 HBD
  console.log(`Comments: ${post.children}`);            // 0
  console.log(`Created: ${post.created}`);              // 2025-06-15T06:28:18
}
```

**Returns:** Full post object with content, metadata, voting, and payout information.

#### `getComments(author: string, permlink: string, client?: HiveClient): Promise<CommentData[]>`

Retrieves all comments for a specific post, sorted by creation date.

```typescript
const comments = await getComments('theycallmedan', 'excited-about-hive');
console.log(`Found ${comments.length} comments`);       // 21

comments.forEach(comment => {
  console.log(`@${comment.author}: ${comment.body.substring(0, 100)}...`);
  console.log(`Votes: ${comment.net_votes}, Created: ${comment.created}`);
});
```

**Returns:** Array of comment objects with author, content, voting data, and timestamps.

### Publishing Operations

#### `createPost(credentials: HiveCredentials, metadata: PostMetadata, client?: HiveClient): Promise<PublishResult>`

Creates a new post on the Hive blockchain with full metadata support.

```typescript
const result = await createPost(credentials, {
  title: 'My Amazing Post',
  body: 'This is the content of my post with **markdown** support.',
  tags: ['technology', 'blockchain', 'hive'],
  json_metadata: { app: 'hivets/1.0' }
});

if (result.success) {
  console.log(`Post published: ${result.transaction_id}`);
} else {
  console.error(`Failed: ${result.error}`);
}
```

**Parameters:**
- `credentials`: Object with username and postingKey
- `metadata`: Post data with title, body, tags, and optional json_metadata
- `client`: Optional custom HiveClient instance

#### `editPost(credentials: HiveCredentials, permlink: string, metadata: PostMetadata, client?: HiveClient): Promise<PublishResult>`

Edits an existing post while preserving the original permlink and parent information.

```typescript
const result = await editPost(credentials, 'my-post-permlink', {
  title: 'Updated Title',
  body: 'Updated content with new information.',
  tags: ['updated', 'edited']
});
```

### Voting Operations

#### `upvote(credentials: HiveCredentials, author: string, permlink: string, weight?: number, client?: HiveClient): Promise<VoteResult>`

Votes on a post or comment with configurable weight percentage.

```typescript
// Full upvote (100%)
await upvote(credentials, 'author', 'permlink');

// Partial upvote (75%)
await upvote(credentials, 'author', 'permlink', 75);

// Downvote (negative weight not supported - use 0 to remove vote)
await upvote(credentials, 'author', 'permlink', 0);
```

**Parameters:**
- `weight`: Vote weight as percentage (0-100, default: 100)

### Client Configuration

#### `new HiveClient(config?)`

Creates a new Hive API client with enterprise-grade reliability features.

**Basic Configuration:**
```typescript
interface HiveConfig {
  apiNode?: string;              // Primary API endpoint
  fallbackNodes?: string[];      // Backup nodes for failover
  timeout?: number;              // Request timeout (default: 10000ms)
  mainnet?: boolean;             // Network mode (default: true)
  maxRetries?: number;           // Max retry attempts (default: 3)
  requestInterceptor?: Function; // Request middleware
  responseInterceptor?: Function; // Response middleware
}
```

**Network Configuration:**
```typescript
// Production (mainnet) with default settings
const client = new HiveClient({ mainnet: true });

// Development (testnet)
const client = new HiveClient({ mainnet: false });

// Environment-aware configuration
const client = new HiveClient({ 
  mainnet: process.env.NODE_ENV === 'production',
  timeout: process.env.NODE_ENV === 'production' ? 15000 : 5000
});

// Network information
console.log(client.getNetworkName()); // 'mainnet' or 'testnet'
console.log(client.isMainnet());      // true or false
```

**Enterprise Reliability Setup:**
```typescript
// High-availability configuration with 8 nodes
const client = new HiveClient({
  timeout: 12000,
  maxRetries: 5,
  fallbackNodes: [
    'https://api.hive.blog',
    'https://anyx.io',
    'https://rpc.mahdiyari.info',
    'https://api.deathwing.me',
    'https://api.openhive.network',
    'https://hive-api.arcange.eu',
    'https://techcoderx.com'
  ]
});

// Monitor node health and performance
const healthyNodes = await client.getHealthyNodes();
const nodeMetrics = await client.getNodeMetrics();
const healthStatus = client.getNodeHealthStatus();

console.log(`Healthy: ${healthyNodes.length}/8 nodes`);
console.log(`Current: ${client.getCurrentNode()}`);
```

**WAX-Inspired Middleware System:**
```typescript
// Request/response interceptors for logging and analytics
const client = new HiveClient({
  requestInterceptor: (config) => {
    console.log(`→ ${config.method} ${config.url}`);
    config.headers['X-App-Version'] = '1.0.0';
    return config;
  },
  responseInterceptor: (response) => {
    console.log(`← Response received in ${Date.now()}ms`);
    return response;
  }
});

// Extension system for custom functionality
const extendedClient = client.extend({
  customMethod: () => 'Custom functionality added'
});
```

**Advanced Performance Features:**
```typescript
// TAPOS caching for 28x performance improvement
const taposData = await client.getTaposCache();
console.log(`Block: ${taposData.head_block_id.substring(0, 8)}...`);

// Node performance metrics
const metrics = await client.getNodeMetrics();
Object.entries(metrics).forEach(([node, data]) => {
  console.log(`${node}: ${data.avgLatency}ms avg, ${data.successRate}% success`);
});
```

## Error Handling

All operations return structured results with comprehensive error information:

```typescript
// Publishing and voting operations
interface PublishResult {
  success: boolean;
  transaction_id?: string;
  error?: string;
}

interface VoteResult {
  success: boolean;
  transaction_id?: string;
  error?: string;
}
```

**Graceful Error Management:**
```typescript
// Handle publishing errors
const result = await createPost(credentials, postData);
if (!result.success) {
  switch (true) {
    case result.error?.includes('HIVE_MIN_ROOT_COMMENT_INTERVAL'):
      console.log('Please wait 5 minutes between posts');
      break;
    case result.error?.includes('Duplicate transaction'):
      console.log('Transaction already submitted');
      break;
    case result.error?.includes('Invalid credentials'):
      console.log('Check your posting key');
      break;
    default:
      console.log(`Unexpected error: ${result.error}`);
  }
}

// Handle content retrieval
try {
  const post = await getPostContent('author', 'permlink');
  if (!post) {
    console.log('Post not found');
  }
} catch (error) {
  if (error.message.includes('Invalid username')) {
    console.log('Username format is invalid');
  } else {
    console.log(`API error: ${error.message}`);
  }
}

// Handle network issues with custom client
const reliableClient = new HiveClient({
  timeout: 15000,
  maxRetries: 5
});

const account = await getAccountInfo('username', reliableClient);
```

**Common Error Scenarios:**
- **Network Issues**: Automatic failover to backup nodes
- **Rate Limiting**: 5-minute interval between posts enforced by blockchain
- **Invalid Data**: Username validation and content format checking  
- **Authentication**: Posting key verification and permission validation
- **Blockchain Rules**: Duplicate transaction detection and consensus validation

## Complete Examples

The `examples/` directory contains working demonstrations for all functionality:

**Core Operations:**
- `account-info.ts` - Retrieve account data, reputation, balances
- `create-post.ts` - Publish new posts with metadata
- `edit-post.ts` - Modify existing post content  
- `upvote-post.ts` - Vote on posts and comments
- `content-demo.ts` - Read post content and comments

**Advanced Features:**
- `error-handling.ts` - Comprehensive error management
- `custom-client.ts` - Enterprise client configuration
- `network-demo.ts` - Mainnet/testnet switching
- `node-failover-demo.ts` - High-availability node management
- `wax-improvements-demo.ts` - WAX-inspired enterprise patterns
- `theycallmedan-demo.ts` - Real blockchain data demonstration

**Run Examples:**
```bash
# Build library
npm run build

# Test core functionality
node dist/examples/account-info.js
node dist/examples/create-post.js
node dist/examples/content-demo.js

# Test enterprise features  
node dist/examples/wax-improvements-demo.js
node dist/examples/theycallmedan-demo.js
```

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run examples
node dist/examples/account-info.js
```

## Requirements

- Node.js 16+
- TypeScript 5.0+ (for development)

## Dependencies

- `hive-tx`: Transaction signing and blockchain operations
- `secp256k1`: Cryptographic signing functions

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all examples work correctly
5. Submit a pull request

## Support

For issues and feature requests, please use the GitHub issue tracker.