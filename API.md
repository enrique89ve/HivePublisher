# HiveTS API Reference

Complete TypeScript API documentation for Hive blockchain operations.

## Core Classes

### HiveClient

Main client for blockchain communication with configurable endpoints.

```typescript
class HiveClient {
  constructor(config?: HiveConfig)
  async call<T>(method: string, params?: any[]): Promise<T>
  async getDynamicGlobalProperties(): Promise<DynamicGlobalProperties>
  async broadcastTransaction(transaction: any): Promise<any>
  async getAccount(username: string): Promise<any>
  async getContent(author: string, permlink: string): Promise<any>
  async getFollowCount(username: string): Promise<any>
  async getAccountInfo(username: string): Promise<any>
}
```

**Configuration Options:**
```typescript
interface HiveConfig {
  apiNode?: string;    // Default: 'https://rpc.mahdiyari.info'
  timeout?: number;    // Default: 10000ms
}
```

## Core Operations

### createPost()

Publishes new content to the Hive blockchain.

```typescript
async function createPost(
  credentials: HiveCredentials,
  metadata: PostMetadata,
  client?: HiveClient
): Promise<PublishResult>
```

**Parameters:**
- `credentials`: Account username and posting key
- `metadata`: Content data including title, body, tags
- `client`: Optional custom client instance

**Returns:** `PublishResult` with success status and transaction ID

### editPost()

Modifies existing blockchain content while preserving metadata.

```typescript
async function editPost(
  credentials: HiveCredentials,
  permlink: string,
  metadata: PostMetadata,
  client?: HiveClient
): Promise<PublishResult>
```

**Parameters:**
- `permlink`: Unique identifier of the post to edit
- Other parameters same as `createPost()`

### upvote()

Casts votes on posts or comments with configurable weight.

```typescript
async function upvote(
  credentials: HiveCredentials,
  author: string,
  permlink: string,
  weight?: number,
  client?: HiveClient
): Promise<VoteResult>
```

**Parameters:**
- `author`: Content creator's username
- `permlink`: Content identifier
- `weight`: Vote strength as percentage (0-100, default: 100)

### getAccountInfo()

Retrieves comprehensive account data from the blockchain.

```typescript
async function getAccountInfo(
  username: string,
  client?: HiveClient
): Promise<AccountInfo | null>
```

**Returns:** Complete account information or null if not found

## Type Definitions

### Core Types

```typescript
interface HiveCredentials {
  username: string;
  postingKey: string;
}

interface PostMetadata {
  title: string;
  body: string;
  tags: string[];
  json_metadata?: Record<string, any>;
  parent_author?: string;
  parent_permlink?: string;
}

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

### Account Information

```typescript
interface AccountInfo {
  id: number;
  name: string;
  block_num: number;
  last_vote_time: string;
  last_root_post: string;
  last_post: string;
  total_posts: string;
  followers: string;
  followings: string;
  reputation: string;
  incoming_vests: string;
  incoming_hp: string;
  outgoing_vests: string;
  outgoing_hp: string;
  creator: string;
  created_at: string;
  owner: Authority;
  active: Authority;
  posting: Authority;
  memo_key: string;
  json_metadata: Record<string, any>;
  posting_metadata: PostingMetadata;
  // ... additional fields
}
```

## Error Handling

All operations return structured results instead of throwing exceptions:

```typescript
// Success case
{
  success: true,
  transaction_id: "abc123..."
}

// Error case
{
  success: false,
  error: "Descriptive error message"
}
```

Common error scenarios handled:
- Network timeouts and connectivity issues
- Invalid credentials or insufficient permissions
- Blockchain validation errors (rate limits, etc.)
- Malformed input data and validation failures

## Usage Patterns

### Basic Operations

```typescript
import { HiveClient, createPost, upvote, getAccountInfo } from 'hivets';

// Account lookup
const account = await getAccountInfo('username');

// Content creation
const result = await createPost(credentials, {
  title: 'Hello Hive',
  body: 'Content here',
  tags: ['introduction']
});

// Voting
const vote = await upvote(credentials, 'author', 'permlink', 75);
```

### Advanced Configuration

```typescript
// Custom client
const client = new HiveClient({
  apiNode: 'https://custom-node.com',
  timeout: 15000
});

// Use with operations
const result = await createPost(credentials, metadata, client);
```

### Error Handling

```typescript
const result = await createPost(credentials, metadata);

if (result.success) {
  console.log(`Published: ${result.transaction_id}`);
} else {
  console.error(`Failed: ${result.error}`);
}
```

## Rate Limits

Hive blockchain enforces several rate limits:
- Posts: Once every 5 minutes per account
- Edits: Once per block (~3 seconds) per content
- Votes: Once every 3 seconds per account

The library automatically handles these constraints and provides informative error messages.