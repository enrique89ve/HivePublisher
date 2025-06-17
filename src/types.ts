/**
 * TypeScript type definitions for Hive blockchain operations
 * @fileoverview Comprehensive type definitions with JSDoc documentation
 * @version 1.0.0
 */

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Configuration options for HiveClient initialization
 * @example
 * ```typescript
 * const config: HiveConfig = {
 *   apiNode: 'https://api.hive.blog',
 *   timeout: 10000,
 *   mainnet: true
 * };
 * ```
 */
export interface HiveConfig {
  /** Primary Hive API node endpoint. If not provided, uses default based on network */
  apiNode?: string;
  /** List of fallback API nodes for automatic failover */
  fallbackNodes?: string[];
  /** Request timeout in milliseconds @default 10000 */
  timeout?: number;
  /** Network mode - true for mainnet, false for testnet @default true */
  mainnet?: boolean;
  /** Maximum retry attempts for failed nodes @default 3 */
  maxRetries?: number;
  /** Enable REST API support for enhanced performance @default false */
  enableRestApi?: boolean;
  /** Request interceptor for middleware and custom headers */
  requestInterceptor?: RequestInterceptor;
  /** Response interceptor for custom response handling */
  responseInterceptor?: ResponseInterceptor;
}

/**
 * Function type for intercepting and modifying requests before they are sent
 */
export type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;

/**
 * Function type for intercepting and modifying responses before they are returned
 */
export type ResponseInterceptor = (response: unknown) => unknown | Promise<unknown>;

/**
 * Configuration object for individual HTTP requests
 */
export interface RequestConfig {
  /** Target URL for the request */
  url: string;
  /** HTTP method (GET, POST, etc.) */
  method: string;
  /** Request headers as key-value pairs */
  headers: Record<string, string>;
  /** Request body as string */
  body: string;
  /** Request timeout in milliseconds */
  timeout: number;
}

// ============================================================================
// Authentication Types
// ============================================================================

/**
 * Hive account credentials for blockchain operations
 * @example
 * ```typescript
 * const credentials: HiveCredentials = {
 *   username: 'alice',
 *   postingKey: '5K...' // Your posting private key
 * };
 * ```
 */
export interface HiveCredentials {
  /** Hive username (without @ symbol) */
  username: string;
  /** Private posting key for signing transactions */
  postingKey: string;
}

// ============================================================================
// Content Types
// ============================================================================

/**
 * Metadata for creating or editing posts on Hive
 * @example
 * ```typescript
 * const post: PostMetadata = {
 *   title: 'Hello World',
 *   body: '# My first post\n\nHello Hive community!',
 *   tags: ['introduction', 'hello'],
 *   description: 'My introduction to the Hive community'
 * };
 * ```
 */
export interface PostMetadata {
  /** Post title (required for top-level posts) */
  title: string;
  /** Post body content in markdown or HTML */
  body: string;
  /** Post tags for categorization (max 10 tags, first tag is primary category) */
  tags: string[];
  /** Post description for SEO and previews */
  description?: string;
  /** Featured image URL for the post */
  image?: string;
  /** Custom JSON metadata for additional properties */
  json_metadata?: Record<string, unknown>;
  /** Parent author username (for comments/replies) */
  parent_author?: string;
  /** Parent post permlink (for comments/replies) */
  parent_permlink?: string;
}

/**
 * Internal representation of a post operation for blockchain submission
 * @internal
 */
export interface PostOperation {
  /** Parent author (empty string for top-level posts) */
  parent_author: string;
  /** Parent permlink (category for top-level posts) */
  parent_permlink: string;
  /** Author username */
  author: string;
  /** Post permlink (URL-friendly identifier) */
  permlink: string;
  /** Post title */
  title: string;
  /** Post body content */
  body: string;
  /** Stringified JSON metadata */
  json_metadata: string;
}

/**
 * Vote operation parameters
 * @example
 * ```typescript
 * const vote: VoteOperation = {
 *   voter: 'alice',
 *   author: 'bob',
 *   permlink: 'awesome-post',
 *   weight: 10000 // 100% upvote
 * };
 * ```
 */
export interface VoteOperation {
  /** Username of the voter */
  voter: string;
  /** Username of the post author */
  author: string;
  /** Post permlink */
  permlink: string;
  /** Vote weight (-10000 to 10000, where 10000 = 100% upvote) */
  weight: number;
}

// ============================================================================
// Blockchain Types
// ============================================================================

/**
 * Hive blockchain transaction structure
 * @internal
 */
export interface Transaction {
  /** Reference block number for TAPOS */
  ref_block_num: number;
  /** Reference block prefix for TAPOS */
  ref_block_prefix: number;
  /** Transaction expiration time in ISO format */
  expiration: string;
  /** Array of operations to execute */
  operations: unknown[][];
  /** Transaction extensions (usually empty) */
  extensions: unknown[];
  /** Digital signatures for the transaction */
  signatures: string[];
}

/**
 * Dynamic global properties from Hive blockchain
 * @internal
 */
export interface DynamicGlobalProperties {
  /** Current head block number */
  head_block_number: number;
  /** Current head block ID */
  head_block_id: string;
  /** Current blockchain time */
  time: string;
  /** Total vesting fund STEEM */
  total_vesting_fund_steem?: string;
  /** Total vesting shares */
  total_vesting_shares?: string;
}

// ============================================================================
// Response Types
// ============================================================================

/**
 * Standard Hive RPC response structure
 * @template T - Type of the result data
 */
export interface HiveResponse<T = unknown> {
  /** Request ID */
  id: number;
  /** Response result data */
  result: T;
  /** Error information if request failed */
  error?: {
    /** Error code */
    code: number;
    /** Error message */
    message: string;
    /** Additional error data */
    data?: unknown;
  };
}

/**
 * Result of a successful post creation or edit operation
 * @example
 * ```typescript
 * const result: PublishResult = {
 *   success: true,
 *   transaction_id: 'abc123...',
 *   permlink: 'my-awesome-post-20231215',
 *   url: 'https://hive.blog/@alice/my-awesome-post-20231215'
 * };
 * ```
 */
export interface PublishResult {
  /** Whether the operation was successful */
  success: boolean;
  /** Blockchain transaction ID */
  transaction_id?: string;
  /** Generated or provided permlink */
  permlink?: string;
  /** Full URL to the published post */
  url?: string;
  /** Error message if operation failed */
  error?: string;
  /** Additional error details */
  details?: string;
  /** Updated content details (for edit operations) */
  updated_content?: {
    title: string;
    body: string;
    tags: string[];
  };
}

/**
 * Result of a vote operation
 * @example
 * ```typescript
 * const result: VoteResult = {
 *   success: true,
 *   transaction_id: 'def456...',
 *   voter: 'alice',
 *   author: 'bob',
 *   permlink: 'great-post',
 *   weight: 10000
 * };
 * ```
 */
export interface VoteResult {
  /** Whether the vote was successful */
  success: boolean;
  /** Blockchain transaction ID */
  transaction_id?: string;
  /** Username of the voter */
  voter?: string;
  /** Username of the post author */
  author?: string;
  /** Post permlink */
  permlink?: string;
  /** Vote weight used */
  weight?: number;
  /** Error message if operation failed */
  error?: string;
  /** Additional error details */
  details?: string;
}

// ============================================================================
// Account and Content Data Types
// ============================================================================

/**
 * Comprehensive Hive account information
 * @example
 * ```typescript
 * const account: HiveAccount = {
 *   id: 123456,
 *   name: 'alice',
 *   posting_json_metadata: '{"profile":{"name":"Alice"}}',
 *   reputation: 7234567890,
 *   // ... other properties
 * };
 * ```
 */
export interface HiveAccount {
  /** Account ID number */
  id: number;
  /** Account username */
  name: string;
  /** Account creation timestamp */
  created: string;
  /** JSON metadata for profile information */
  posting_json_metadata: string;
  /** Account reputation score */
  reputation: number;
  /** HIVE token balance */
  balance: string;
  /** Hive Backed Dollar balance */
  hbd_balance: string;
  /** Vesting shares (HIVE Power) */
  vesting_shares: string;
  /** Delegated vesting shares */
  delegated_vesting_shares: string;
  /** Received vesting shares */
  received_vesting_shares: string;
  /** Voting power (0-10000) */
  voting_power: number;
  /** Last vote time */
  last_vote_time: string;
  /** Number of posts */
  post_count: number;
  /** Account recovery partner */
  recovery_account: string;
  /** Whether account can vote */
  can_vote: boolean;
  /** Voting mana percentage */
  voting_mana_pct: number;
  /** Voting mana bar */
  voting_manabar: {
    current_mana: number;
    last_update_time: number;
  };
}

/**
 * Hive post/comment content structure
 * @example
 * ```typescript
 * const content: HiveContent = {
 *   id: 789,
 *   author: 'bob',
 *   permlink: 'my-post',
 *   title: 'My Amazing Post',
 *   body: '# Hello World\n\nThis is my post content.',
 *   // ... other properties
 * };
 * ```
 */
export interface HiveContent {
  /** Content ID */
  id: number;
  /** Author username */
  author: string;
  /** Content permlink */
  permlink: string;
  /** Content title */
  title: string;
  /** Content body */
  body: string;
  /** JSON metadata */
  json_metadata: string;
  /** Posting metadata (raw from blockchain) */
  posting_metadata?: string;
  /** Creation timestamp */
  created: string;
  /** Last update timestamp */
  last_update: string;
  /** Content depth (0 for posts, >0 for comments) */
  depth: number;
  /** Number of children (comments) */
  children: number;
  /** Net votes (upvotes - downvotes) */
  net_votes: number;
  /** Pending payout value */
  pending_payout_value: string;
  /** Total payout value */
  total_payout_value: string;
  /** Curator payout value */
  curator_payout_value: string;
  /** Whether post is active (can receive votes) */
  active: string;
  /** Content category */
  category: string;
  /** Parent author (for comments) */
  parent_author: string;
  /** Parent permlink (for comments) */
  parent_permlink: string;
  /** Content URL */
  url: string;
  /** Root title (for comments) */
  root_title: string;
  /** Beneficiaries for rewards */
  beneficiaries: Array<{
    account: string;
    weight: number;
  }>;
  /** Active votes on the content */
  active_votes: Array<{
    voter: string;
    weight: number;
    rshares: number;
    percent: number;
    time: string;
  }>;
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Custom error class for Hive-related operations * @example
 * ```typescript
 * throw new HiveError('Invalid posting key provided', 'INVALID_CREDENTIALS', {
 *   username: 'alice'
 * });
 * ```
 */
export class HiveError extends Error {
  /** Error code for programmatic handling */
  public readonly code: string;
  /** Additional error context */
  public readonly context?: Record<string, unknown>;
  /** Original error that caused this error */
  public readonly cause?: Error;
  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    context?: Record<string, unknown>,
    cause?: Error
  ) {
    super(message);
    this.name = 'HiveError';
    this.code = code;
    if (context !== undefined) {
      this.context = context;
    }
    if (cause !== undefined) {
      this.cause = cause;
    }

    // Maintains proper stack trace for where our error was thrown (Node.js only)
    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, HiveError);
    }
  }
}

// ============================================================================
// Common Error Codes
// ============================================================================

/**
 * Standard error codes used throughout the library
 */
export const ERROR_CODES = {
  // Authentication errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  MISSING_POSTING_KEY: 'MISSING_POSTING_KEY',
  INVALID_PRIVATE_KEY: 'INVALID_PRIVATE_KEY',

  // Validation errors
  INVALID_USERNAME: 'INVALID_USERNAME',
  INVALID_PERMLINK: 'INVALID_PERMLINK',
  INVALID_TAGS: 'INVALID_TAGS',
  MISSING_TITLE: 'MISSING_TITLE',
  MISSING_BODY: 'MISSING_BODY',
  INVALID_VOTE_WEIGHT: 'INVALID_VOTE_WEIGHT',

  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  NODE_UNAVAILABLE: 'NODE_UNAVAILABLE',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  ALL_NODES_FAILED: 'ALL_NODES_FAILED',

  // Blockchain errors
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  INSUFFICIENT_RC: 'INSUFFICIENT_RC',
  DUPLICATE_TRANSACTION: 'DUPLICATE_TRANSACTION',
  ACCOUNT_NOT_FOUND: 'ACCOUNT_NOT_FOUND',
  CONTENT_NOT_FOUND: 'CONTENT_NOT_FOUND',

  // General errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  INVALID_RESPONSE: 'INVALID_RESPONSE',
} as const;

/**
 * Type for error codes
 */
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Makes specified properties optional
 * @template T - The original type
 * @template K - The keys to make optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Makes specified properties required
 * @template T - The original type
 * @template K - The keys to make required
 */
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Deep partial type for nested objects
 * @template T - The type to make deeply partial
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Record<string, unknown> ? DeepPartial<T[P]> : T[P];
};

// ============================================================================
// Additional Data Types (Legacy Compatibility)
// ============================================================================

/**
 * Legacy AccountInfo interface for backward compatibility
 * @deprecated Use HiveAccount instead
 */
export interface AccountInfo {
  /** Account ID */
  id: number;
  /** Account username */
  name: string;
  /** Account creation date */
  created: string;
  /** Account JSON metadata */
  json_metadata: string;
  /** Account reputation */
  reputation: number;
  /** HIVE balance */
  balance: string;
  /** HBD balance */
  hbd_balance: string;
  /** Vesting shares */
  vesting_shares: string;
  /** Delegated vesting shares */
  delegated_vesting_shares: string;
  /** Received vesting shares */
  received_vesting_shares: string;
  /** Voting power */
  voting_power: number;
  /** Last vote time */
  last_vote_time: string;
  /** Post count */
  post_count: number;
  /** Can vote flag */
  can_vote: boolean;
  /** Voting mana bar */
  voting_manabar: {
    current_mana: number;
    last_update_time: number;
  };
  /** Voting mana percentage (0-100) */
  voting_mana_pct: number;
  /** Estimated value of a 100% vote in HIVE */
  vote_value?: number;
  /** Follow count */
  follow_count?: number;
  /** Following count */
  following_count?: number;
  /** Effective HIVE Power (vesting shares converted) */
  hive_power?: number;
}

/**
 * Post content data structure
 */
export interface PostContent {
  /** Post ID */
  id: number;
  /** Author username */
  author: string;
  /** Post permlink */
  permlink: string;
  /** Post title */
  title: string;
  /** Post body content */
  body: string;
  /** JSON metadata */
  json_metadata: string;
  /** Posting metadata (raw from blockchain) */
  posting_metadata?: string;
  /** Creation timestamp */
  created: string;
  /** Last update timestamp */
  last_update: string;
  /** Post category */
  category: string;
  /** Content depth (0 for posts) */
  depth: number;
  /** Number of children comments */
  children: number;
  /** Net votes */
  net_votes: number;
  /** Pending payout value */
  pending_payout_value: string;
  /** Total payout value */
  total_payout_value: string;
  /** Curator payout value */
  curator_payout_value: string;
  /** Whether post is active */
  active: string;
  /** Parent author (empty for top-level posts) */
  parent_author: string;
  /** Parent permlink (category for top-level posts) */
  parent_permlink: string;
  /** Post URL */
  url: string;
  /** Root title */
  root_title: string;
  /** Beneficiaries */
  beneficiaries: Array<{
    account: string;
    weight: number;
  }>;
  /** Active votes */
  active_votes: Array<{
    voter: string;
    weight: number;
    rshares: number;
    percent: number;
    time: string;
  }>;
}

/**
 * Comment data structure
 */
export interface CommentData {
  /** Comment ID */
  id: number;
  /** Comment author */
  author: string;
  /** Comment permlink */
  permlink: string;
  /** Comment body */
  body: string;
  /** JSON metadata */
  json_metadata: string;
  /** Creation timestamp */
  created: string;
  /** Last update timestamp */
  last_update: string;
  /** Comment depth */
  depth: number;
  /** Number of children */
  children: number;
  /** Net votes */
  net_votes: number;
  /** Pending payout value */
  pending_payout_value: string;
  /** Total payout value */
  total_payout_value: string;
  /** Parent author */
  parent_author: string;
  /** Parent permlink */
  parent_permlink: string;
  /** Comment URL */
  url: string;
  /** Root author */
  root_author: string;
  /** Root permlink */
  root_permlink: string;
  /** Root title */
  root_title: string;
  /** Active votes */
  active_votes: Array<{
    voter: string;
    weight: number;
    rshares: number;
    percent: number;
    time: string;
  }>;
}

/**
 * Options for updating an existing post with automatic content merging
 * @example
 * ```typescript
 * const updates: PostUpdateOptions = {
 *   title: 'Updated Title',
 *   prependToBody: 'UPDATE: New information...\n\n',
 *   appendToBody: '\n\nEDIT: Added more details.',
 *   tags: ['updated', 'revised']
 * };
 * ```
 */
/**
 * Edit modes for post updates
 */
export type EditMode = 'prepend' | 'append' | 'replace';

/**
 * Options for updating an existing post with automatic content fetching
 * @example
 * ```typescript
 * // Add content to the end (default mode)
 * const update: PostUpdateOptions = {
 *   newContent: '\n\n**EDIT**: Added more details.',
 *   mode: 'append' // optional, this is default
 * };
 *
 * // Add content to the beginning
 * const update: PostUpdateOptions = {
 *   newContent: 'UPDATE: New information added...\n\n',
 *   mode: 'prepend'
 * };
 *
 * // Replace entire content
 * const update: PostUpdateOptions = {
 *   title: 'New Title',
 *   newContent: 'Completely new content...',
 *   mode: 'replace'
 * };
 * ```
 */
export interface PostUpdateOptions {
  /** New content to add/replace (required) */
  newContent: string;
  /** Edit mode: where to place the new content @default 'append' */
  mode?: EditMode;
  /** New title (optional - keeps existing if not provided) */
  title?: string;
  /** New tags (optional - keeps existing if not provided) */
  tags?: string[];
  /** Post description for SEO and previews (optional) */
  description?: string;
  /** Featured image URL for the post (optional) */
  image?: string;
  /** Custom JSON metadata for additional properties (optional) */
  json_metadata?: Record<string, unknown>;
}

// ============================================================================
