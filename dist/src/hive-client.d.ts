/**
 * Main Hive client for blockchain communication
 */
import { HiveConfig, DynamicGlobalProperties } from './types.js';
export declare class HiveClient {
    private apiNode;
    private fallbackNodes;
    private timeout;
    private mainnet;
    private maxRetries;
    private currentNodeIndex;
    private nodeHealthStatus;
    constructor(config?: HiveConfig);
    /**
     * Get default primary API node based on network configuration
     */
    private getDefaultApiNode;
    /**
     * Get default fallback nodes based on network configuration
     * Optimized list based on WAX patterns and proven reliability
     */
    private getDefaultFallbackNodes;
    /**
     * Get all available nodes (primary + fallbacks)
     */
    private getAllNodes;
    /**
     * Check if client is configured for mainnet
     */
    isMainnet(): boolean;
    /**
     * Get current network name
     */
    getNetworkName(): string;
    /**
     * Make RPC call with automatic node failover and retry logic
     */
    call<T = any>(method: string, params?: any): Promise<T>;
    /**
     * Make a single request to a specific node
     */
    private makeRequest;
    /**
     * Delay utility for retry logic
     */
    private delay;
    /**
     * Get current active node information
     */
    getCurrentNode(): string;
    /**
     * Get all configured nodes
     */
    getConfiguredNodes(): string[];
    /**
     * Check node health with caching (WAX-inspired pattern)
     */
    private checkNodeHealth;
    /**
     * Get healthy nodes prioritized by current preference
     */
    getHealthyNodes(): Promise<string[]>;
    /**
     * Get node health status for monitoring
     */
    getNodeHealthStatus(): Record<string, {
        healthy: boolean;
        lastCheck: number;
    }>;
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