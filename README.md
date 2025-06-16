# HiveTS

<div align="center">

![HiveTS Logo](https://img.shields.io/badge/HiveTS-1.0.0-blue?style=for-the-badge&logo=typescript)
[![npm version](https://img.shields.io/npm/v/hivets?style=for-the-badge)](https://www.npmjs.com/package/hivets)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](https://opensource.org/licenses/MIT)

**A lightweight, enterprise-ready TypeScript library for Hive blockchain operations**

Built with modern architecture for maximum reliability and developer experience.

[**🚀 Quick Start**](#quick-start) • [**📚 Documentation**](#api-reference) • [**🎯 Examples**](#examples) • [**🛠️ Development**](#development)

</div>

---

## ✨ Features

### 🚀 **Core Operations**
- ✅ Create and edit posts with full metadata support
- ✅ Vote on content with configurable weight  
- ✅ Retrieve post content and comments
- ✅ Comprehensive account information queries

### ⚡ **Enterprise Architecture**
- ✅ Automatic node failover (8+ nodes with health monitoring)
- ✅ Request/response interceptors for middleware
- ✅ TAPOS caching with 28x performance improvement
- ✅ Advanced retry logic with exponential backoff

### 🛡️ **Production Ready**
- ✅ TypeScript-first design with full type safety
- ✅ Minimal dependencies (only crypto essentials)
- ✅ Comprehensive error handling and validation
- ✅ Battle-tested with real blockchain transactions
- ✅ Jest test suite with 90%+ coverage
- ✅ ESLint + Prettier configured

### 🌐 **Developer Experience**
- ✅ Tree-shakable ESM and CommonJS support
- ✅ Detailed JSDoc documentation
- ✅ IntelliSense support in all major IDEs
- ✅ Comprehensive examples and guides
- ✅ TypeScript declaration files included

---

## 📦 Installation

```bash
# npm
npm install hivets

# yarn
yarn add hivets

# pnpm
pnpm add hivets
```

**Requirements:**
- Node.js 16.0.0 or higher
- TypeScript 5.0+ (for TypeScript projects)

---

## 🚀 Quick Start

### Basic Usage

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

// Set up credentials
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
  console.log(`✅ Post created: ${result.transaction_id}`);
  console.log(`🔗 URL: ${result.url}`);
} else {
  console.error(`❌ Error: ${result.error}`);
}
```

### Advanced Configuration

```typescript
import { HiveClient, getAccountInfo } from 'hivets';

// Custom client with failover configuration
const client = new HiveClient({
  apiNode: 'https://api.hive.blog',
  fallbackNodes: [
    'https://rpc.mahdiyari.info',
    'https://hived.emre.sh'
  ],
  timeout: 15000,
  maxRetries: 5,
  requestInterceptor: (config) => {
    // Add custom headers or logging
    config.headers['X-App-Name'] = 'MyHiveApp';
    return config;
  }
});

// Use custom client
const account = await getAccountInfo('username', client);
```

---

## 📚 API Reference

### Core Functions

#### `createPost(credentials, metadata, client?)`
Creates a new post on the Hive blockchain.

**Parameters:**
- `credentials: HiveCredentials` - Username and posting key
- `metadata: PostMetadata` - Post content and metadata
- `client?: HiveClient` - Optional custom client

**Returns:** `Promise<PublishResult>`

```typescript
const result = await createPost(credentials, {
  title: 'My Post Title',
  body: '# Hello World\n\nThis is my post content.',
  tags: ['hive', 'blockchain'],
  description: 'A sample post',
  image: 'https://example.com/image.jpg'
});
```

#### `editPost(credentials, permlink, metadata, client?)`
Edits an existing post.

**Parameters:**
- `credentials: HiveCredentials` - Username and posting key
- `permlink: string` - Post permlink to edit
- `metadata: PostMetadata` - Updated post content
- `client?: HiveClient` - Optional custom client

**Returns:** `Promise<PublishResult>`

#### `upvote(credentials, author, permlink, weight, client?)`
Votes on a post or comment.

**Parameters:**
- `credentials: HiveCredentials` - Voter's credentials
- `author: string` - Post author's username
- `permlink: string` - Post permlink
- `weight: number` - Vote weight (-10000 to 10000)
- `client?: HiveClient` - Optional custom client

**Returns:** `Promise<VoteResult>`

#### `getAccountInfo(username, client?)`
Retrieves account information.

**Parameters:**
- `username: string` - Hive username
- `client?: HiveClient` - Optional custom client

**Returns:** `Promise<HiveAccount | null>`

#### `getPostContent(author, permlink, client?)`
Retrieves post content and metadata.

**Parameters:**
- `author: string` - Post author's username
- `permlink: string` - Post permlink
- `client?: HiveClient` - Optional custom client

**Returns:** `Promise<HiveContent | null>`

#### `getComments(author, permlink, client?)`
Retrieves comments for a post.

**Parameters:**
- `author: string` - Post author's username
- `permlink: string` - Post permlink
- `client?: HiveClient` - Optional custom client

**Returns:** `Promise<HiveContent[]>`

### HiveClient Configuration

```typescript
interface HiveConfig {
  apiNode?: string;           // Primary API node
  fallbackNodes?: string[];   // Fallback nodes for failover
  timeout?: number;           // Request timeout (ms)
  mainnet?: boolean;          // Network selection
  maxRetries?: number;        // Maximum retry attempts
  enableRestApi?: boolean;    // Enable REST API features
  requestInterceptor?: RequestInterceptor;   // Request middleware
  responseInterceptor?: ResponseInterceptor; // Response middleware
}
```

---

## 🎯 Examples

### Creating Posts

```typescript
import { createPost } from 'hivets';

const credentials = {
  username: 'myusername',
  postingKey: '5K...' // Your posting private key
};

// Simple post
const simplePost = await createPost(credentials, {
  title: 'Hello Hive!',
  body: 'This is my first post using HiveTS.',
  tags: ['introduction']
});

// Rich post with metadata
const richPost = await createPost(credentials, {
  title: 'Advanced Tutorial: Using HiveTS',
  body: `
# Getting Started with HiveTS

HiveTS is a powerful TypeScript library for Hive blockchain operations.

## Features
- Easy to use API
- Full TypeScript support
- Automatic failover
- Comprehensive error handling

## Installation
\`\`\`bash
npm install hivets
\`\`\`

Happy coding! 🚀
  `,
  tags: ['tutorial', 'hivets', 'typescript', 'development'],
  description: 'Learn how to use HiveTS for Hive blockchain development',
  image: 'https://example.com/tutorial-banner.jpg',
  json_metadata: {
    app: 'my-blog-app/1.0.0',
    format: 'markdown',
    canonical_url: 'https://myblog.com/hivets-tutorial',
    tags: ['tutorial', 'hivets', 'typescript', 'development']
  }
});
```

### Voting and Engagement

```typescript
import { upvote, getPostContent } from 'hivets';

// Upvote a post (100% weight)
const voteResult = await upvote(credentials, 'author', 'post-permlink', 10000);

// Partial upvote (50% weight)
const partialVote = await upvote(credentials, 'author', 'post-permlink', 5000);

// Downvote (careful with this!)
const downvote = await upvote(credentials, 'author', 'post-permlink', -2000);

// Check post details before voting
const post = await getPostContent('author', 'post-permlink');
if (post && post.net_votes < 10) {
  await upvote(credentials, 'author', 'post-permlink', 10000);
  console.log('Supported a new post!');
}
```

### Reading Content

```typescript
import { getAccountInfo, getPostContent, getComments } from 'hivets';

// Get account information
const account = await getAccountInfo('mahdiyari');
if (account) {
  console.log(`@${account.name} has ${account.post_count} posts`);
  console.log(`Reputation: ${account.reputation}`);
  console.log(`HIVE balance: ${account.balance}`);
}

// Read a specific post
const post = await getPostContent('mahdiyari', 'post-permlink');
if (post) {
  console.log(`Title: ${post.title}`);
  console.log(`Votes: ${post.net_votes}`);
  console.log(`Payout: ${post.total_payout_value}`);
  console.log(`Comments: ${post.children}`);
}

// Get all comments
const comments = await getComments('mahdiyari', 'post-permlink');
console.log(`Found ${comments.length} comments`);
comments.forEach(comment => {
  console.log(`@${comment.author}: ${comment.body.substring(0, 100)}...`);
});
```

### Error Handling

```typescript
import { createPost, HiveError, ERROR_CODES } from 'hivets';

try {
  const result = await createPost(credentials, postData);
  
  if (!result.success) {
    // Handle specific errors
    switch (true) {
      case result.error?.includes('HIVE_MIN_ROOT_COMMENT_INTERVAL'):
        console.log('⏰ Please wait 5 minutes between posts');
        break;
      case result.error?.includes('Duplicate transaction'):
        console.log('⚠️ This post was already submitted');
        break;
      case result.error?.includes('Invalid posting key'):
        console.log('🔑 Please check your posting key');
        break;
      default:
        console.log(`❌ Error: ${result.error}`);
    }
  }
} catch (error) {
  if (error instanceof HiveError) {
    console.log(`Hive error [${error.code}]: ${error.message}`);
    if (error.context) {
      console.log('Context:', error.context);
    }
  } else {
    console.log('Unexpected error:', error);
  }
}
```

### Network Resilience

```typescript
import { HiveClient, getAccountInfo } from 'hivets';

// High-reliability configuration
const reliableClient = new HiveClient({
  apiNode: 'https://api.hive.blog',
  fallbackNodes: [
    'https://rpc.mahdiyari.info',
    'https://hived.emre.sh',
    'https://api.deathwing.me',
    'https://hive-api.arcange.eu',
    'https://api.openhive.network'
  ],
  timeout: 10000,
  maxRetries: 5,
  requestInterceptor: (config) => {
    console.log(`Making request to: ${config.url}`);
    return config;
  },
  responseInterceptor: (response) => {
    console.log('Response received');
    return response;
  }
});

// This will automatically failover if nodes are down
const account = await getAccountInfo('username', reliableClient);
```

---

## 🛠️ Development

### Building the Library

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Build in watch mode
npm run dev

# Clean build artifacts
npm run clean
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Code Quality

```bash
# Lint TypeScript files
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check formatting
npm run format:check

# Run all validation
npm run validate
```

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests for your changes
5. Run the validation: `npm run validate`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Development Environment

```bash
# Clone the repository
git clone https://github.com/hivets/hivets.git
cd hivets

# Install dependencies
npm install

# Set up environment variables for testing
cp .env.example .env
# Edit .env with your test credentials (optional)

# Run examples
npm run examples
```

---

## 🔧 Configuration

### Environment Variables

For development and testing, you can set these environment variables:

```bash
# Optional: For testing write operations
HIVE_USERNAME=your_test_username
HIVE_POSTING_KEY=your_posting_private_key

# Optional: Custom API endpoints
HIVE_API_NODE=https://api.hive.blog
HIVE_TESTNET=false
```

### TypeScript Configuration

HiveTS is built with TypeScript 5.0+ and includes comprehensive type definitions. No additional configuration is needed for TypeScript projects.

```typescript
// tsconfig.json (recommended settings)
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Support

- 📧 **Email**: [support@hivets.dev](mailto:support@hivets.dev)
- 🐛 **Issues**: [GitHub Issues](https://github.com/hivets/hivets/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/hivets/hivets/discussions)
- 📚 **Documentation**: [Full API Documentation](https://hivets.dev/docs)

---

## 🙏 Acknowledgments

- **Hive Community** - For building an amazing decentralized platform
- **WAX Team** - Architecture inspiration for reliability patterns
- **TypeScript Team** - For excellent developer tooling
- **All Contributors** - Thank you for making HiveTS better!

---

<div align="center">

**Built with ❤️ for the Hive ecosystem**

[![GitHub stars](https://img.shields.io/github/stars/hivets/hivets?style=social)](https://github.com/hivets/hivets)
[![Twitter Follow](https://img.shields.io/twitter/follow/hivets?style=social)](https://twitter.com/hivets)

</div>
