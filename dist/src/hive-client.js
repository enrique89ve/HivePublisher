"use strict";
/**
 * Main Hive client for blockchain communication
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HiveClient = void 0;
const types_1 = require("./types");
class HiveClient {
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
                throw new types_1.HiveError(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            if (data.error) {
                throw new types_1.HiveError(data.error.message, data.error.code, data.error.data);
            }
            return data.result;
        }
        catch (error) {
            if (error instanceof types_1.HiveError) {
                throw error;
            }
            throw new types_1.HiveError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get dynamic global properties
     */
    async getDynamicGlobalProperties() {
        return this.call('condenser_api.get_dynamic_global_properties');
    }
    /**
     * Broadcast transaction
     */
    async broadcastTransaction(transaction) {
        return this.call('condenser_api.broadcast_transaction', [transaction]);
    }
    /**
     * Get account information
     */
    async getAccount(username) {
        const accounts = await this.call('condenser_api.get_accounts', [[username]]);
        return accounts[0] || null;
    }
    /**
     * Get content (post/comment)
     */
    async getContent(author, permlink) {
        return this.call('condenser_api.get_content', [author, permlink]);
    }
}
exports.HiveClient = HiveClient;
//# sourceMappingURL=hive-client.js.map