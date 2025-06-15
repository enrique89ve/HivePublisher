# HiveTS Library - Complete AI Replication Guide

## Overview for AI Systems

This document provides comprehensive instructions for AI systems to understand, replicate, and extend the HiveTS library. The library is a TypeScript implementation for Hive blockchain interactions with enterprise-grade features inspired by WAX blockchain patterns.

## Core Architecture Understanding

### 1. Library Purpose
- **Primary Goal**: Lightweight TypeScript library for Hive blockchain operations
- **Reading Functions**: Account info, post content, comments (minimal dependencies)
- **Writing Functions**: Create posts, edit posts, upvote (requires hive-tx for cryptographic signing)
- **Enterprise Features**: Node failover, health monitoring, request interceptors

### 2. Key Design Decisions

#### Dependency Strategy
```typescript
// Reading operations: Minimal dependencies
// - Only uses fetch/HTTP requests to Hive API nodes
// - No heavy cryptographic libraries needed
// - Lightweight and fast for data retrieval

// Writing operations: Requires hive-tx
// - Need proper transaction signing for Hive blockchain
// - hive-tx provides accurate cryptographic operations
// - Essential for createPost, editPost, upvote functions
```

#### Network Architecture
```typescript
// WAX-inspired node management
// - Primary node with fallback array
// - Automatic health checking and failover
// - Request/response interceptors for monitoring
// - Mainnet vs testnet configuration
```

## Complete File Structure and Implementation

### 1. Core Files Required

```
src/
├── index.ts           # Main exports
├── types.ts           # TypeScript interfaces  
├── hive-client.ts     # Network client with failover
├── crypto.ts          # Cryptographic utilities
├── operations.ts      # Writing functions (posts, votes)
├── content.ts         # Reading functions (posts, comments)
└── accounts.ts        # Account information functions

examples/
├── create-post.ts     # Post creation example
├── content-demo.ts    # Reading content example
├── account-info.ts    # Account data example
└── comprehensive-demo.ts # Full functionality demo
```

### 2. Package.json Dependencies

```json
{
  "dependencies": {
    "@types/node": "^24.0.1",
    "hive-tx": "^6.1.3",
    "typescript": "^5.8.3"
  }
}
```

### 3. TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

## Core Implementation Patterns

### 1. Hive Client with Failover

```typescript
export class HiveClient {
  private apiNode: string;
  private fallbackNodes: string[];
  private timeout: number;
  private maxRetries: number;
  private currentNodeIndex: number = 0;
  
  // WAX-inspired health monitoring
  private nodeHealthStatus: Map<string, { healthy: boolean; lastCheck: number }>;
  
  constructor(config: HiveConfig = {}) {
    this.apiNode = config.apiNode || this.getDefaultApiNode();
    this.fallbackNodes = config.fallbackNodes || this.getDefaultFallbackNodes();
    this.timeout = config.timeout || 10000;
    this.maxRetries = config.maxRetries || 3;
    this.mainnet = config.mainnet !== false;
  }

  // Automatic failover with retry logic
  async call<T = any>(method: string, params: any = []): Promise<T> {
    const allNodes = this.getAllNodes();
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
          continue;
        }
      }
      
      if (attempt < this.maxRetries - 1) {
        await this.delay(1000 * (attempt + 1));
      }
    }
    
    throw new HiveError(`All nodes failed after ${this.maxRetries} attempts. Last error: ${lastError?.message}`);
  }
}
```

### 2. Reading Functions Pattern

```typescript
// Lightweight implementation for data retrieval
export async function getAccountInfo(
  username: string,
  client?: HiveClient
): Promise<AccountInfo | null> {
  const hiveClient = client || new HiveClient();
  
  try {
    // Input validation
    if (!username || typeof username !== 'string') {
      throw new HiveError('Invalid username format');
    }
    
    // API call to Hive blockchain
    const [account] = await hiveClient.call('condenser_api.get_accounts', [[username]]);
    
    if (!account) {
      return null;
    }
    
    // Transform blockchain data to clean interface
    const accountInfo: AccountInfo = {
      username: account.name,
      display_name: parseJsonSafely(account.posting_json_metadata)?.profile?.name || account.name,
      reputation: parseReputation(account.reputation),
      created: account.created,
      // ... more fields
    };
    
    return accountInfo;
  } catch (error) {
    throw new HiveError(`Failed to get account info: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
```

### 3. Writing Functions Pattern

```typescript
// Requires hive-tx for proper blockchain transaction format
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
    
    // Generate permlink
    const permlink = generatePermlink(metadata.title);
    
    // Create Hive operation
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
          app: 'hivets/1.0.0'
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
      transaction_id: txId || result.id,
      permlink: permlink
    };
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
```

## Key Implementation Requirements

### 1. Error Handling Strategy

```typescript
// Custom error class for library
export class HiveError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HiveError';
  }
}

// Comprehensive validation
function validateCredentials(credentials: HiveCredentials): void {
  if (!credentials.username || !credentials.postingKey) {
    throw new HiveError('Username and posting key are required');
  }
  
  if (typeof credentials.username !== 'string' || credentials.username.length < 3) {
    throw new HiveError('Invalid username format');
  }
  
  if (typeof credentials.postingKey !== 'string' || credentials.postingKey.length < 50) {
    throw new HiveError('Invalid posting key format');
  }
}
```

### 2. Network Configuration

```typescript
// Default API nodes for reliability
private getDefaultApiNode(): string {
  return this.mainnet 
    ? 'https://api.hive.blog'
    : 'https://testnet.openhive.network';
}

private getDefaultFallbackNodes(): string[] {
  return this.mainnet ? [
    'https://api.hivekings.com',
    'https://anyx.io',
    'https://api.openhive.network',
    'https://hived.emre.sh'
  ] : [
    'https://testnet.openhive.network'
  ];
}
```

### 3. Data Transformation Utilities

```typescript
// Parse Hive reputation correctly
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

// Convert VESTS to HP accurately
function convertVestsToHp(vests: string, globalProps: any): string {
  const vestsNumber = parseFloat(vests);
  const totalVests = parseFloat(globalProps.total_vesting_shares.split(' ')[0]);
  const totalHive = parseFloat(globalProps.total_vesting_fund_hive.split(' ')[0]);
  
  const hp = (vestsNumber * totalHive) / totalVests;
  return hp.toFixed(3);
}
```

## Testing and Validation

### 1. Reading Functions Test

```typescript
// Test with real blockchain data
const account = await getAccountInfo('theycallmedan');
console.log(`Reputation: ${account.reputation}`); // Should show ~79.65
console.log(`Posts: ${account.total_posts}`); // Should show real count

const post = await getPostContent('theycallmedan', 'some-post-permlink');
console.log(`Title: ${post.title}`); // Should show real post title
```

### 2. Writing Functions Test

```typescript
// Requires real credentials from environment
const credentials = {
  username: process.env.HIVE_USERNAME,
  postingKey: process.env.HIVE_POSTING_KEY
};

const result = await createPost(credentials, {
  title: 'Test Post',
  body: 'This is a test post.',
  tags: ['test']
});

// Should return: { success: true, transaction_id: 'abc123...' }
```

## Critical Implementation Notes

### 1. Why hive-tx is Required for Writing

```typescript
// This WON'T work - custom crypto implementation fails
// Hive blockchain requires specific transaction format and signing

// This WORKS - hive-tx provides correct Hive transaction structure
const { Transaction } = await import('hive-tx');
const tx = new Transaction();
await tx.create([operation]);
const signed = tx.sign(privateKey);
```

### 2. Blockchain Rate Limits

```typescript
// Hive enforces posting intervals
// Error: "You may only post once every 5 minutes"
// This is expected behavior, not a library bug
```

### 3. Node Health Monitoring

```typescript
// Implement health checking for enterprise reliability
private async checkNodeHealth(node: string): Promise<boolean> {
  try {
    const start = Date.now();
    await this.makeRequest(node, 'condenser_api.get_dynamic_global_properties');
    const latency = Date.now() - start;
    return latency < 5000; // 5 second timeout
  } catch {
    return false;
  }
}
```

## Replication Instructions for AI

### Step 1: Initialize Project
```bash
npm init -y
npm install typescript @types/node hive-tx
npx tsc --init
```

### Step 2: Create Core Structure
1. Create src/ directory with all core files
2. Implement HiveClient with failover logic
3. Add reading functions (accounts.ts, content.ts)
4. Add writing functions (operations.ts) with hive-tx
5. Create comprehensive type definitions

### Step 3: Add Enterprise Features
1. Node health monitoring
2. Request/response interceptors
3. Caching mechanisms (TAPOS)
4. Performance metrics

### Step 4: Testing Strategy
1. Test reading functions with real blockchain data
2. Test writing functions with valid credentials
3. Validate error handling and edge cases
4. Confirm node failover behavior

### Step 5: Documentation
1. Complete README with usage examples
2. API reference for all functions
3. Error handling documentation
4. Network configuration guide

## Success Criteria

A successful replication should:
- ✅ Read account data from real Hive blockchain
- ✅ Create posts with valid transaction IDs
- ✅ Handle node failures gracefully
- ✅ Provide TypeScript type safety
- ✅ Work with both mainnet and testnet
- ✅ Include comprehensive error handling

## Common Pitfalls to Avoid

1. **Don't** try to implement custom crypto for writing functions
2. **Don't** ignore Hive's posting rate limits
3. **Don't** hardcode API nodes without fallbacks
4. **Don't** skip input validation
5. **Don't** use mock data in examples

This guide provides everything needed to replicate the HiveTS library with full functionality and enterprise-grade reliability.