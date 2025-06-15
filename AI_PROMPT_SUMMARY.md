# AI Prompt: Replicate HiveTS Blockchain Library

## Task Overview
Create a complete TypeScript library for Hive blockchain interactions with enterprise-grade reliability patterns.

## Core Requirements

### Reading Functions (Lightweight)
- `getAccountInfo(username)` - Account data, reputation, followers, posts
- `getPostContent(author, permlink)` - Post title, body, votes, metadata  
- `getComments(author, permlink)` - Comment threads for posts
- Zero heavy dependencies, only HTTP requests to Hive API nodes

### Writing Functions (Requires hive-tx)
- `createPost(credentials, metadata)` - Publish new posts with title/body/tags
- `editPost(credentials, permlink, metadata)` - Update existing posts
- `upvote(credentials, author, permlink, weight)` - Vote on posts/comments
- Must use hive-tx library for proper Hive transaction signing

### Enterprise Features
- Automatic node failover with health monitoring
- Configurable retry logic and timeouts
- Request/response interceptors for analytics
- Support for mainnet and testnet networks

## Critical Implementation Details

### Dependencies
```json
{
  "dependencies": {
    "hive-tx": "^6.1.3",
    "@types/node": "^24.0.1", 
    "typescript": "^5.8.3"
  }
}
```

### Network Client Pattern
```typescript
class HiveClient {
  // Primary node: https://api.hive.blog
  // Fallbacks: api.hivekings.com, anyx.io, api.openhive.network
  // Auto-failover on errors with exponential backoff
  async call(method: string, params: any[]): Promise<any>
}
```

### Writing Function Pattern
```typescript
export async function createPost(credentials, metadata, client?) {
  // 1. Validate inputs (username, posting key, title, body, tags)
  // 2. Generate unique permlink from title
  // 3. Create Hive comment operation
  // 4. Parse posting key with hive-tx: PrivateKey.from(wif)
  // 5. Sign transaction with hive-tx Transaction class
  // 6. Broadcast to blockchain via client.broadcastTransaction()
  // 7. Return { success: true, transaction_id: "real-tx-id" }
}
```

### Data Transformation
```typescript
// Hive reputation calculation (log10 based)
function parseReputation(rep: string): string {
  const rawRep = parseInt(rep);
  const reputation = Math.log10(Math.abs(rawRep)) - 9;
  const finalRep = rawRep < 0 ? 25 - reputation * 9 : reputation * 9 + 25;
  return Math.max(0, Math.min(100, finalRep)).toFixed(2);
}

// VESTS to Hive Power conversion  
function convertVestsToHp(vests: string, globalProps: any): string {
  const vestsNum = parseFloat(vests);
  const totalVests = parseFloat(globalProps.total_vesting_shares.split(' ')[0]);
  const totalHive = parseFloat(globalProps.total_vesting_fund_hive.split(' ')[0]);
  return ((vestsNum * totalHive) / totalVests).toFixed(3);
}
```

## Validation Requirements

### Test Reading Functions
```typescript
// Must return real blockchain data
const account = await getAccountInfo('theycallmedan');
// Expected: reputation ~79.65, real follower count, actual post count

const post = await getPostContent('theycallmedan', 'some-permlink');  
// Expected: actual post title, body, vote count from blockchain
```

### Test Writing Functions
```typescript
// Must use real Hive credentials
const result = await createPost(credentials, {
  title: 'Test Post',
  body: 'Content',
  tags: ['test']
});
// Expected: { success: true, transaction_id: "verifiable-on-blockchain" }
```

## Key Architecture Rules

1. **Reading operations**: Use only fetch() for HTTP requests, no crypto libraries
2. **Writing operations**: Must use hive-tx for transaction signing - custom crypto fails
3. **Error handling**: Comprehensive validation with custom HiveError class
4. **Node management**: Health checking, automatic failover, retry logic
5. **Data integrity**: Never use mock data, only real blockchain responses

## Expected Blockchain Behaviors

- Posting rate limit: "You may only post once every 5 minutes" (normal Hive behavior)
- Transaction IDs: Real hex strings like "4b5c05f5956ea90335a1352d7dae88e7d530ee84"
- Reputation scores: Calculated values like 79.65, 72.40 for real accounts
- Account data: Actual follower counts, post counts, balances from blockchain

## File Structure
```
src/
├── index.ts (main exports)
├── types.ts (interfaces, HiveError class)
├── hive-client.ts (network client with failover)
├── crypto.ts (parsePrivateKey using hive-tx)
├── operations.ts (createPost, editPost, upvote)
├── content.ts (getPostContent, getComments)  
└── accounts.ts (getAccountInfo)

examples/
├── create-post.ts
├── content-demo.ts
└── comprehensive-demo.ts
```

## Success Criteria
- TypeScript compilation without errors
- Reading functions return real Hive blockchain data
- Writing functions generate verifiable transaction IDs
- Node failover works when APIs are down
- All functions handle errors gracefully
- Library works on both mainnet and testnet

Create this library with enterprise reliability patterns while maintaining simplicity for developers. The writing functions must use hive-tx for cryptographic operations - this is non-negotiable for Hive blockchain compatibility.