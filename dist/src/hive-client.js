/**
 * Main Hive client for blockchain communication
 */
import { HiveError } from './types.js';
export class HiveClient {
    constructor(config = {}) {
        this.apiNode = config.apiNode || 'https://api.hive.blog';
        this.timeout = config.timeout || 10000;
    }
    /**
     * Make RPC call to Hive API
     */
    async call(method, params = []) {
        const payload = {
            jsonrpc: '2.0',
            method,
            params,
            id: Date.now()
        };
        try {
            const response = await fetch(this.apiNode, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(this.timeout)
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new HiveError(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
            }
            const data = await response.json();
            if (data.error) {
                throw new HiveError(data.error.message, data.error.code, data.error.data);
            }
            return data.result;
        }
        catch (error) {
            if (error instanceof HiveError) {
                throw error;
            }
            throw new HiveError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get dynamic global properties
     */
    async getDynamicGlobalProperties() {
        return this.call('database_api.get_dynamic_global_properties', []);
    }
    /**
     * Broadcast transaction
     */
    async broadcastTransaction(transaction) {
        return this.call('condenser_api.broadcast_transaction', [transaction]);
    }
    /**
     * Get account information using database_api.find_accounts
     */
    async getAccount(username) {
        const result = await this.call('database_api.find_accounts', { accounts: [username] });
        return result.accounts[0] || null;
    }
    /**
     * Get content (post/comment)
     */
    async getContent(author, permlink) {
        return this.call('condenser_api.get_content', [author, permlink]);
    }
    /**
     * Get follow count for an account
     */
    async getFollowCount(username) {
        try {
            return await this.call('follow_api.get_follow_count', [username]);
        }
        catch (error) {
            // Follow API might not be available on all nodes
            return { follower_count: 0, following_count: 0 };
        }
    }
    /**
     * Get detailed account information
     */
    async getAccountInfo(username) {
        return this.call('condenser_api.get_accounts', [[username]]);
    }
}
//# sourceMappingURL=hive-client.js.map