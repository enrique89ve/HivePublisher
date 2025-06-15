/**
 * Main Hive client for blockchain communication
 */
import { HiveConfig, DynamicGlobalProperties } from './types.js';
export declare class HiveClient {
    private apiNode;
    private timeout;
    private mainnet;
    constructor(config?: HiveConfig);
    /**
     * Get default API node based on network configuration
     */
    private getDefaultApiNode;
    /**
     * Check if client is configured for mainnet
     */
    isMainnet(): boolean;
    /**
     * Get current network name
     */
    getNetworkName(): string;
    /**
     * Make RPC call to Hive API with proper error handling and request configuration
     */
    call<T = any>(method: string, params?: any): Promise<T>;
    /**
     * Get dynamic global properties
     */
    getDynamicGlobalProperties(): Promise<DynamicGlobalProperties>;
    /**
     * Broadcast transaction
     */
    broadcastTransaction(transaction: any): Promise<any>;
    /**
     * Broadcast transaction synchronously (alternative method)
     */
    broadcastTransactionSynchronous(transaction: any): Promise<any>;
    /**
     * Get account information using condenser_api.get_accounts
     */
    getAccount(username: string): Promise<any>;
    /**
     * Get content (post/comment)
     */
    getContent(author: string, permlink: string): Promise<any>;
    /**
     * Get follow count for an account
     */
    getFollowCount(username: string): Promise<any>;
    /**
     * Get detailed account information
     */
    getAccountInfo(username: string): Promise<any>;
}
//# sourceMappingURL=hive-client.d.ts.map