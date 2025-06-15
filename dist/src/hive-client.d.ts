/**
 * Main Hive client for blockchain communication
 */
import { HiveConfig, DynamicGlobalProperties } from './types.js';
export declare class HiveClient {
    private apiNode;
    private timeout;
    constructor(config?: HiveConfig);
    /**
     * Make RPC call to Hive API
     */
    call<T = any>(method: string, params?: any[]): Promise<T>;
    /**
     * Get dynamic global properties
     */
    getDynamicGlobalProperties(): Promise<DynamicGlobalProperties>;
    /**
     * Broadcast transaction
     */
    broadcastTransaction(transaction: any): Promise<any>;
    /**
     * Get account information
     */
    getAccount(username: string): Promise<any>;
    /**
     * Get content (post/comment)
     */
    getContent(author: string, permlink: string): Promise<any>;
}
//# sourceMappingURL=hive-client.d.ts.map