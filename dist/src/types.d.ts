/**
 * TypeScript type definitions for Hive blockchain operations
 */
export interface HiveConfig {
    /** Hive API node endpoint */
    apiNode?: string;
    /** Request timeout in milliseconds */
    timeout?: number;
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
export declare class HiveError extends Error {
    code?: number | undefined;
    data?: any | undefined;
    constructor(message: string, code?: number | undefined, data?: any | undefined);
}
//# sourceMappingURL=types.d.ts.map