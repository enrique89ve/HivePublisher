# Complete AI Prompt: HiveTS Library Understanding and Replication

## Prompt for AI Systems

You are tasked with understanding and replicating a complete TypeScript library for Hive blockchain interactions. This library provides both lightweight reading capabilities and full writing functionality with enterprise-grade features.

### What You're Building

Create a TypeScript library called "HiveTS" that enables:

1. **Reading Operations** (lightweight, minimal dependencies):
   - Get account information with reputation, followers, posts count
   - Retrieve post content with metadata, votes, and timestamps  
   - Fetch comments for any post with threading support

2. **Writing Operations** (requires hive-tx for cryptographic signing):
   - Create new posts with title, body, tags, and metadata
   - Edit existing posts with updated content
   - Upvote/downvote posts and comments with custom weight

3. **Enterprise Features** (WAX blockchain inspired):
   - Automatic node failover and health monitoring
   - Request/response interceptors for analytics
   - Network resilience with retry logic
   - Mainnet/testnet configuration support

### Core Architecture Principles

#### Dependency Strategy
```typescript
// Reading functions: Zero heavy dependencies
// - Use only fetch() for HTTP requests to Hive API nodes
// - Parse JSON responses and transform to clean interfaces
// - Fast and lightweight for data retrieval

// Writing functions: Require hive-tx library
// - Hive blockchain needs specific transaction format
// - Cryptographic signing must match Hive's protocol
// - hive-tx provides accurate implementation
```

#### Node Management Pattern
```typescript
// Primary node with fallback array
const config = {
  apiNode: 'https://api.hive.blog',
  fallbackNodes: [
    'https://api.hivekings.com',
    'https://anyx.io',
    'https://api.openhive.network'
  ],
  maxRetries: 3,
  timeout: 10000
};

// Automatic failover logic
// 1. Try primary node
// 2. If fails, try each fallback in order
// 3. Retry with exponential backoff
// 4. Health check failed nodes periodically
```

### Complete Implementation Guide

#### 1. Project Setup
```bash
# Initialize TypeScript project
npm init -y
npm install typescript @types/node hive-tx
npx tsc --init

# Configure tsconfig.json for modern ES modules
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

#### 2. Core Type Definitions (src/types.ts)
```typescript
export interface HiveCredentials {
  username: string;
  postingKey: string;
}

export interface PostMetadata {
  title: string;
  body: string;
  tags: string[];
  description?: string;
  image?: string;
}

export interface AccountInfo {
  username: string;
  display_name: string;
  reputation: string;
  created: string;
  followers: number;
  following: number;
  total_posts: number;
  hive_balance: string;
  hbd_balance: string;
  hp_balance: string;
  profile_image?: string;
  cover_image?: string;
  about?: string;
  location?: string;
  website?: string;
}

export interface PostContent {
  id: number;
  author: string;
  permlink: string;
  title: string;
  body: string;
  category: string;
  created: string;
  updated: string;
  active_votes: any[];
  net_votes: number;
  pending_payout_value: string;
  author_payout_value: string;
  curator_payout_value: string;
  json_metadata: any;
  tags: string[];
}

export interface PublishResult {
  success: boolean;
  transaction_id?: string;
  permlink?: string;
  error?: string;
}

export class HiveError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HiveError';
  }
}
```

#### 3. Network Client with Failover (src/hive-client.ts)
```typescript
export class HiveClient {
  private apiNode: string;
  private fallbackNodes: string[];
  private timeout: number;
  private maxRetries: number;
  private currentNodeIndex: number = 0;
  private nodeHealthStatus: Map<string, { healthy: boolean; lastCheck: number }> = new Map();

  constructor(config: HiveConfig = {}) {
    this.apiNode = config.apiNode || this.getDefaultApiNode();
    this.fallbackNodes = config.fallbackNodes || this.getDefaultFallbackNodes();
    this.timeout = config.timeout || 10000;
    this.maxRetries = config.maxRetries || 3;
    this.mainnet = config.mainnet !== false;
  }

  // Core RPC call with automatic failover
  async call<T = any>(method: string, params: any = []): Promise<T> {
    const allNodes = [this.apiNode, ...this.fallbackNodes];
    let lastError: any;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      for (let i = 0; i < allNodes.length; i++) {
        const nodeIndex = (this.currentNodeIndex + i) % allNodes.length;
        const node = allNodes[nodeIndex];
        
        try {
          const result = await this.makeRequest<T>(node, method, params);
          this.currentNodeIndex = nodeIndex;
          return result;
        } catch (error) {
          lastError = error;
          await this.markNodeUnhealthy(node);
          continue;
        }
      }
      
      if (attempt < this.maxRetries - 1) {
        await this.delay(1000 * (attempt + 1));
      }
    }
    
    throw new HiveError(`All nodes failed after ${this.maxRetries} attempts. Last error: ${lastError?.message}`);
  }

  private async makeRequest<T>(node: string, method: string, params: any = []): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(node, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: method,
          params: params,
          id: 1
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'RPC Error');
      }

      return data.result;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
}
```

#### 4. Reading Functions (src/accounts.ts, src/content.ts)
```typescript
// Account information retrieval
export async function getAccountInfo(
  username: string,
  client?: HiveClient
): Promise<AccountInfo | null> {
  const hiveClient = client || new HiveClient();
  
  try {
    if (!username || typeof username !== 'string') {
      throw new HiveError('Invalid username format');
    }

    const [account] = await hiveClient.call('condenser_api.get_accounts', [[username]]);
    
    if (!account) {
      return null;
    }

    // Get follow count
    const followCount = await hiveClient.call('condenser_api.get_follow_count', [username]);
    
    // Get global properties for HP conversion
    const globalProps = await hiveClient.getDynamicGlobalProperties();
    
    const accountInfo: AccountInfo = {
      username: account.name,
      display_name: parseJsonSafely(account.posting_json_metadata)?.profile?.name || account.name,
      reputation: parseReputation(account.reputation),
      created: account.created,
      followers: followCount?.follower_count || 0,
      following: followCount?.following_count || 0,
      total_posts: account.post_count || 0,
      hive_balance: account.balance,
      hbd_balance: account.hbd_balance,
      hp_balance: convertVestsToHp(account.vesting_shares, globalProps),
      profile_image: parseJsonSafely(account.posting_json_metadata)?.profile?.profile_image,
      cover_image: parseJsonSafely(account.posting_json_metadata)?.profile?.cover_image,
      about: parseJsonSafely(account.posting_json_metadata)?.profile?.about,
      location: parseJsonSafely(account.posting_json_metadata)?.profile?.location,
      website: parseJsonSafely(account.posting_json_metadata)?.profile?.website
    };

    return accountInfo;
  } catch (error) {
    throw new HiveError(`Failed to get account info: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Post content retrieval
export async function getPostContent(
  author: string,
  permlink: string,
  client?: HiveClient
): Promise<PostContent | null> {
  const hiveClient = client || new HiveClient();
  
  try {
    const content = await hiveClient.call('condenser_api.get_content', [author, permlink]);
    
    if (!content || !content.author) {
      return null;
    }

    const postContent: PostContent = {
      id: content.id,
      author: content.author,
      permlink: content.permlink,
      title: content.title,
      body: content.body,
      category: content.category,
      created: content.created,
      updated: content.last_update,
      active_votes: content.active_votes,
      net_votes: content.net_votes,
      pending_payout_value: content.pending_payout_value,
      author_payout_value: content.author_payout_value,
      curator_payout_value: content.curator_payout_value,
      json_metadata: parseJsonSafely(content.json_metadata),
      tags: parseJsonSafely(content.json_metadata)?.tags || []
    };

    return postContent;
  } catch (error) {
    throw new HiveError(`Failed to get post content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
```

#### 5. Writing Functions (src/operations.ts)
```typescript
// Create new post with hive-tx signing
export async function createPost(
  credentials: HiveCredentials,
  metadata: PostMetadata,
  client?: HiveClient
): Promise<PublishResult> {
  const hiveClient = client || new HiveClient();
  
  try {
    // Validate inputs
    validateCredentials(credentials);
    validatePostMetadata(metadata);
    
    // Generate unique permlink
    const permlink = generatePermlink(metadata.title);
    
    // Create comment operation
    const commentOperation = [
      'comment',
      {
        parent_author: '',
        parent_permlink: metadata.tags[0] || 'blog',
        author: credentials.username,
        permlink: permlink,
        title: metadata.title,
        body: metadata.body,
        json_metadata: JSON.stringify({
          tags: metadata.tags,
          description: metadata.description,
          image: metadata.image,
          app: 'hivets/1.0.0',
          format: 'markdown'
        })
      }
    ];

    // Parse private key using hive-tx
    const privateKey = parsePrivateKey(credentials.postingKey);

    // Create and sign transaction using hive-tx
    const { Transaction } = await import('hive-tx');
    const tx = new Transaction();
    await tx.create([commentOperation]);
    const signedTransaction = tx.sign(privateKey);
    const { txId } = tx.digest();

    // Broadcast to blockchain
    const result = await hiveClient.broadcastTransaction(signedTransaction);
    
    return {
      success: true,
      transaction_id: txId || result.id || result.tx_id,
      permlink: permlink
    };
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Upvote post or comment
export async function upvote(
  credentials: HiveCredentials,
  author: string,
  permlink: string,
  weight: number = 100,
  client?: HiveClient
): Promise<VoteResult> {
  const hiveClient = client || new HiveClient();
  
  try {
    validateCredentials(credentials);
    
    if (weight < 0 || weight > 100) {
      throw new HiveError('Vote weight must be between 0 and 100');
    }
    
    const hiveWeight = Math.floor(weight * 100);
    
    const voteOperation = [
      'vote',
      {
        voter: credentials.username,
        author: author,
        permlink: permlink,
        weight: hiveWeight
      }
    ];

    const privateKey = parsePrivateKey(credentials.postingKey);
    
    const { Transaction } = await import('hive-tx');
    const tx = new Transaction();
    await tx.create([voteOperation]);
    const signedTransaction = tx.sign(privateKey);
    const { txId } = tx.digest();

    const result = await hiveClient.broadcastTransaction(signedTransaction);
    
    return {
      success: true,
      transaction_id: txId || result.id || result.tx_id
    };
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
```

#### 6. Cryptographic Utilities (src/crypto.ts)
```typescript
import { PrivateKey } from 'hive-tx';
import { HiveError } from './types.js';

export function parsePrivateKey(privateKeyWif: string): PrivateKey {
  try {
    return PrivateKey.from(privateKeyWif);
  } catch (error) {
    throw new HiveError(`Invalid private key format: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
```

#### 7. Main Exports (src/index.ts)
```typescript
export { HiveClient } from './hive-client.js';
export { getAccountInfo } from './accounts.js';
export { getPostContent, getComments } from './content.js';
export { createPost, editPost, upvote } from './operations.js';
export { parsePrivateKey } from './crypto.js';
export * from './types.js';
```

### Usage Examples

#### Reading Account Information
```typescript
import { getAccountInfo } from 'hivets';

const account = await getAccountInfo('theycallmedan');
console.log(`Reputation: ${account.reputation}`);
console.log(`Followers: ${account.followers}`);
console.log(`Posts: ${account.total_posts}`);
```

#### Creating a Post
```typescript
import { createPost } from 'hivets';

const credentials = {
  username: 'your-username',
  postingKey: 'your-posting-key'
};

const result = await createPost(credentials, {
  title: 'My First Post',
  body: 'This is the content of my post.',
  tags: ['introduction', 'blog']
});

if (result.success) {
  console.log(`Post created: ${result.transaction_id}`);
}
```

#### Custom Client Configuration
```typescript
import { HiveClient, getAccountInfo } from 'hivets';

const client = new HiveClient({
  apiNode: 'https://api.hive.blog',
  fallbackNodes: ['https://anyx.io'],
  timeout: 15000,
  maxRetries: 5
});

const account = await getAccountInfo('username', client);
```

### Critical Implementation Requirements

#### 1. Why hive-tx is Essential for Writing
```typescript
// This approach FAILS - custom crypto doesn't match Hive format
// Hive blockchain requires specific transaction structure

// This approach WORKS - hive-tx provides correct implementation
const { Transaction } = await import('hive-tx');
const tx = new Transaction();
await tx.create([operation]);
const signed = tx.sign(privateKey);
```

#### 2. Data Transformation Functions
```typescript
// Accurate Hive reputation calculation
function parseReputation(rep: string | number): string {
  if (!rep) return '25.00';
  
  const rawRep = typeof rep === 'string' ? parseInt(rep) : rep;
  if (rawRep === 0) return '25.00';
  
  const isNegative = rawRep < 0;
  const absoluteRep = Math.abs(rawRep);
  const reputation = Math.log10(absoluteRep) - 9;
  const finalRep = isNegative ? 25 - reputation * 9 : reputation * 9 + 25;
  
  return Math.max(0, Math.min(100, finalRep)).toFixed(2);
}

// Convert VESTS to Hive Power
function convertVestsToHp(vests: string, globalProps: any): string {
  const vestsNumber = parseFloat(vests);
  const totalVests = parseFloat(globalProps.total_vesting_shares.split(' ')[0]);
  const totalHive = parseFloat(globalProps.total_vesting_fund_hive.split(' ')[0]);
  
  const hp = (vestsNumber * totalHive) / totalVests;
  return hp.toFixed(3);
}
```

### Testing Strategy

#### 1. Validate Reading Functions
```typescript
// Test with real blockchain data
const account = await getAccountInfo('theycallmedan');
// Should return reputation ~79.65, real follower count

const post = await getPostContent('theycallmedan', 'some-permlink');
// Should return actual post content, votes, metadata
```

#### 2. Validate Writing Functions
```typescript
// Requires real Hive credentials
const result = await createPost(credentials, testPost);
// Should return: { success: true, transaction_id: 'real-tx-id' }
// Transaction ID should be verifiable on Hive blockchain
```

### Expected Blockchain Behaviors

#### Rate Limits
```typescript
// Hive enforces posting intervals
// Error: "You may only post once every 5 minutes"
// This is correct blockchain behavior, not a bug
```

#### Transaction Confirmation
```typescript
// Successful operations return real transaction IDs
// Example: "4b5c05f5956ea90335a1352d7dae88e7d530ee84"
// These can be verified on hiveblocks.com or peakd.com
```

### Success Validation Criteria

Your implementation is correct when:
- ✅ getAccountInfo() returns real reputation scores (like 79.65 for theycallmedan)
- ✅ createPost() generates verifiable transaction IDs
- ✅ Node failover works when primary API is down
- ✅ TypeScript compilation succeeds without errors
- ✅ All functions handle errors gracefully
- ✅ Reading functions work without hive-tx dependency
- ✅ Writing functions require and use hive-tx properly

### Common Implementation Mistakes to Avoid

1. **Don't** implement custom cryptography for writing operations
2. **Don't** use mock data in examples or tests
3. **Don't** ignore Hive's posting rate limits
4. **Don't** hardcode single API endpoints without fallbacks
5. **Don't** skip input validation and error handling

This comprehensive guide provides everything needed to understand and replicate the complete HiveTS library with all its enterprise features and blockchain functionality.