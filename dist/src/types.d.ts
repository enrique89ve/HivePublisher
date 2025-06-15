/**
 * TypeScript type definitions for Hive blockchain operations
 */
export interface HiveConfig {
    /** Primary Hive API node endpoint */
    apiNode?: string;
    /** List of fallback API nodes */
    fallbackNodes?: string[];
    /** Request timeout in milliseconds */
    timeout?: number;
    /** Network mode - true for mainnet, false for testnet */
    mainnet?: boolean;
    /** Maximum retry attempts for failed nodes */
    maxRetries?: number;
    /** Enable REST API support (WAX-inspired) */
    enableRestApi?: boolean;
    /** Request interceptor for middleware */
    requestInterceptor?: RequestInterceptor;
    /** Response interceptor for middleware */
    responseInterceptor?: ResponseInterceptor;
}
export interface RequestInterceptor {
    (config: RequestConfig): RequestConfig | Promise<RequestConfig>;
}
export interface ResponseInterceptor {
    (response: any): any | Promise<any>;
}
export interface RequestConfig {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: string;
    timeout: number;
}
export interface HiveCredentials {
    /** Hive username */
    username: string;
    /** Posting private key */
    postingKey: string;
}
export interface PostMetadata {
    /** Post title */
    title: string;
    /** Post body content */
    body: string;
    /** Post tags */
    tags: string[];
    /** Additional metadata */
    json_metadata?: Record<string, any>;
    /** Parent author (for comments/replies) */
    parent_author?: string;
    /** Parent permlink (for comments/replies) */
    parent_permlink?: string;
}
export interface PostOperation {
    parent_author: string;
    parent_permlink: string;
    author: string;
    permlink: string;
    title: string;
    body: string;
    json_metadata: string;
}
export interface Transaction {
    ref_block_num: number;
    ref_block_prefix: number;
    expiration: string;
    operations: any[][];
    extensions: any[];
    signatures: string[];
}
export interface DynamicGlobalProperties {
    head_block_number: number;
    head_block_id: string;
    time: string;
}
export interface HiveResponse<T = any> {
    id: number;
    result: T;
    error?: {
        code: number;
        message: string;
        data?: any;
    };
}
export interface PublishResult {
    success: boolean;
    transaction_id?: string;
    error?: string;
}
export interface VoteResult {
    success: boolean;
    transaction_id?: string;
    error?: string;
}
export interface Authority {
    key_auths: [string, number][];
    account_auths: [string, number][];
    weight_threshold: number;
}
export interface AccountProfile {
    name?: string;
    about?: string;
    version?: number;
    website?: string;
    location?: string;
    dtube_pub?: string;
    cover_image?: string;
    profile_image?: string;
    witness_description?: string;
}
export interface PostingMetadata {
    profile?: AccountProfile;
}
export interface AccountInfo {
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
    last_update: string;
    last_owner_update: string;
    recovery: string;
    reward_hive_balance: string;
    reward_hbd_balance: string;
    reward_vests_balance: string;
    reward_vests_balance_hp: string;
    next_vesting_withdrawal: string | null;
    to_withdraw: string;
    vesting_withdraw_rate: string;
    withdrawn: string;
    withdraw_routes: any;
    proxy: string | null;
    pending_hive_savings_withdrawal: any;
    pending_hbd_savings_withdrawal: any;
}
/**
 * Complete post content from Hive blockchain
 */
export interface PostContent {
    id: number;
    author: string;
    permlink: string;
    title: string;
    body: string;
    category: string;
    parent_author: string;
    parent_permlink: string;
    json_metadata: Record<string, any>;
    created: string;
    last_update: string;
    depth: number;
    children: number;
    net_rshares: string;
    abs_rshares: string;
    vote_rshares: string;
    children_abs_rshares: string;
    cashout_time: string;
    max_cashout_time: string;
    total_vote_weight: string;
    reward_weight: number;
    total_payout_value: string;
    curator_payout_value: string;
    author_rewards: number;
    net_votes: number;
    root_comment: number;
    max_accepted_payout: string;
    percent_hbd: number;
    allow_replies: boolean;
    allow_votes: boolean;
    allow_curation_rewards: boolean;
    beneficiaries: any[];
    url: string;
    root_title: string;
    pending_payout_value: string;
    total_pending_payout_value: string;
    active_votes: any[];
    replies: any[];
    author_reputation: string;
    promoted: string;
    body_length: number;
    reblogged_by: string[];
}
/**
 * Comment data structure
 */
export interface CommentData {
    id: number;
    author: string;
    permlink: string;
    parent_author: string;
    parent_permlink: string;
    title: string;
    body: string;
    json_metadata: Record<string, any>;
    created: string;
    last_update: string;
    depth: number;
    children: number;
    net_votes: number;
    total_payout_value: string;
    pending_payout_value: string;
    author_reputation: string;
    active_votes: any[];
    replies: any[];
    cashout_time: string;
    url: string;
}
export declare class HiveError extends Error {
    code?: number | undefined;
    data?: any | undefined;
    constructor(message: string, code?: number | undefined, data?: any | undefined);
}
//# sourceMappingURL=types.d.ts.map