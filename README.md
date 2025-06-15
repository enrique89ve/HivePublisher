# HiveTS

A lightweight, TypeScript-first library for Hive blockchain operations. Built for developers who need simple, reliable access to Hive's core functionality without heavy dependencies.

## Features

- **TypeScript Native**: Full type safety and IntelliSense support
- **Minimal Dependencies**: Only essential cryptographic libraries included
- **Production Ready**: Battle-tested with real blockchain transactions
- **Developer Friendly**: Clear APIs and comprehensive error handling
- **Flexible**: Configurable API endpoints and timeout settings

## Core Operations

- **Account Information**: Retrieve comprehensive user data including reputation, balances, and followers
- **Post Creation**: Publish new posts with markdown support and metadata
- **Post Editing**: Modify existing content with preserved metadata
- **Voting**: Upvote posts and comments with configurable weight percentages

## Quick Start

```bash
npm install hivets
```

```typescript
import { HiveClient, createPost, upvote, getAccountInfo } from 'hivets';

// Initialize client
const client = new HiveClient();

// Get account information
const accountInfo = await getAccountInfo('username');
console.log(`Reputation: ${accountInfo.reputation}`);

// Create a post
const credentials = {
  username: 'your-username',
  postingKey: 'your-posting-key'
};

const postData = {
  title: 'My First Post',
  body: 'Hello Hive blockchain!',
  tags: ['introduction', 'hivets']
};

const result = await createPost(credentials, postData);
if (result.success) {
  console.log(`Post created: ${result.transaction_id}`);
}

// Upvote a post (75% weight)
const voteResult = await upvote(credentials, 'author', 'permlink', 75);
```

## API Reference

### Account Operations

#### `getAccountInfo(username: string): Promise<AccountInfo | null>`

Retrieves comprehensive account information including:
- Basic profile data (name, about, location, website)
- Reputation score and creation date
- Post count and follower statistics
- Token balances (HIVE, HBD, HP)
- Voting power and delegation data

### Publishing Operations

#### `createPost(credentials, metadata, client?): Promise<PublishResult>`

Creates a new post on the Hive blockchain.

**Parameters:**
- `credentials`: Object containing username and posting key
- `metadata`: Post data including title, body, and tags
- `client`: Optional custom HiveClient instance

#### `editPost(credentials, permlink, metadata, client?): Promise<PublishResult>`

Edits an existing post while preserving original metadata.

### Voting Operations

#### `upvote(credentials, author, permlink, weight?, client?): Promise<VoteResult>`

Votes on a post or comment with specified weight percentage.

**Parameters:**
- `weight`: Vote weight as percentage (0-100, default: 100)

### Client Configuration

#### `new HiveClient(config?)`

Creates a new Hive API client with network awareness.

**Configuration Options:**
```typescript
{
  apiNode?: string;        // Primary API endpoint (default: api.hive.blog)
  fallbackNodes?: string[]; // Backup API endpoints for failover
  timeout?: number;        // Request timeout in ms (default: 10000)
  mainnet?: boolean;       // Network mode: true=mainnet, false=testnet (default: true)
  maxRetries?: number;     // Maximum retry attempts (default: 3)
}
```

**Network Configuration:**
```typescript
// Production (mainnet) - default with api.hive.blog
const client = new HiveClient({ mainnet: true });

// Development (testnet)
const client = new HiveClient({ mainnet: false });

// Environment-based
const client = new HiveClient({ 
  mainnet: process.env.NODE_ENV === 'production' 
});

// Check network
console.log(client.getNetworkName()); // 'mainnet' or 'testnet'
console.log(client.isMainnet());      // true or false
```

**Node Failover Configuration:**
```typescript
// Default: api.hive.blog with automatic fallback
const client = new HiveClient();

// Custom primary node with fallbacks
const client = new HiveClient({
  apiNode: 'https://your-preferred-node.com',
  fallbackNodes: [
    'https://api.hive.blog',
    'https://rpc.mahdiyari.info'
  ]
});

// High-reliability setup
const client = new HiveClient({
  timeout: 8000,
  maxRetries: 5,
  fallbackNodes: [
    'https://rpc.mahdiyari.info',
    'https://hived.emre.sh',
    'https://api.deathwing.me'
  ]
});

// Monitor active node
console.log(client.getCurrentNode());
console.log(client.getConfiguredNodes());

// Advanced monitoring (WAX-inspired)
const healthyNodes = await client.getHealthyNodes();
const healthStatus = client.getNodeHealthStatus();
console.log(`Active nodes: ${healthyNodes.length}/${client.getConfiguredNodes().length}`);
```

## Error Handling

All operations return structured results with success/error states:

```typescript
interface PublishResult {
  success: boolean;
  transaction_id?: string;
  error?: string;
}
```

Common error scenarios are handled gracefully:
- Network timeouts and connection issues
- Invalid credentials or permissions
- Blockchain validation errors (posting limits, etc.)
- Malformed data and validation failures

## Examples

The `examples/` directory contains comprehensive usage demonstrations:

- `account-info.ts` - Account data retrieval
- `create-post.ts` - Publishing new content
- `edit-post.ts` - Modifying existing posts
- `upvote-post.ts` - Voting on content
- `error-handling.ts` - Error management patterns
- `custom-client.ts` - Advanced client configuration
- `network-demo.ts` - Mainnet/testnet configuration
- `node-failover-demo.ts` - API node failover and reliability
- `wax-comparison-demo.ts` - Architecture comparison with WAX patterns
- `comprehensive-demo.ts` - Complete library demonstration

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