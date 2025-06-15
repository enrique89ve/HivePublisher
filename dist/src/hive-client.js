/**
 * Main Hive client for blockchain communication
 */
import { HiveError } from './types.js';
export class HiveClient {
    constructor(config = {}) {
        this.currentNodeIndex = 0;
        this.mainnet = config.mainnet !== false; // Default to mainnet
        this.timeout = config.timeout || 10000;
        this.maxRetries = config.maxRetries || 3;
        // Set primary node and fallback list
        this.apiNode = config.apiNode || this.getDefaultApiNode();
        this.fallbackNodes = config.fallbackNodes || this.getDefaultFallbackNodes();
    }
    /**
     * Get default primary API node based on network configuration
     */
    getDefaultApiNode() {
        if (this.mainnet) {
            return 'https://api.hive.blog'; // Primary mainnet node
        }
        else {
            return 'https://testnet.openhive.network'; // Primary testnet node
        }
    }
    /**
     * Get default fallback nodes based on network configuration
     */
    getDefaultFallbackNodes() {
        if (this.mainnet) {
            return [
                'https://rpc.mahdiyari.info',
                'https://hived.emre.sh',
                'https://api.deathwing.me',
                'https://hive-api.arcange.eu',
                'https://api.openhive.network'
            ];
        }
        else {
            return [
                'https://testnet.openhive.network'
            ];
        }
    }
    /**
     * Get all available nodes (primary + fallbacks)
     */
    getAllNodes() {
        return [this.apiNode, ...this.fallbackNodes];
    }
    /**
     * Check if client is configured for mainnet
     */
    isMainnet() {
        return this.mainnet;
    }
    /**
     * Get current network name
     */
    getNetworkName() {
        return this.mainnet ? 'mainnet' : 'testnet';
    }
    /**
     * Make RPC call with automatic node failover and retry logic
     */
    async call(method, params = []) {
        const allNodes = this.getAllNodes();
        let lastError = null;
        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            for (let nodeIndex = 0; nodeIndex < allNodes.length; nodeIndex++) {
                const currentNode = allNodes[(this.currentNodeIndex + nodeIndex) % allNodes.length];
                try {
                    const result = await this.makeRequest(currentNode, method, params);
                    // Success - update current node index for future calls
                    this.currentNodeIndex = (this.currentNodeIndex + nodeIndex) % allNodes.length;
                    if (nodeIndex > 0 && process.env.NODE_ENV === 'development') {
                        console.log(`[HiveTS] Switched to node: ${currentNode}`);
                    }
                    return result;
                }
                catch (error) {
                    lastError = error;
                    if (process.env.NODE_ENV === 'development') {
                        console.log(`[HiveTS] Node ${currentNode} failed: ${lastError.message}`);
                    }
                    // Continue to next node
                }
            }
            // All nodes failed for this attempt, wait before retrying
            if (attempt < this.maxRetries - 1) {
                await this.delay(1000 * (attempt + 1)); // Exponential backoff
            }
        }
        throw new HiveError(`All nodes failed after ${this.maxRetries} attempts. Last error: ${lastError?.message || 'Unknown error'}`);
    }
    /**
     * Make a single request to a specific node
     */
    async makeRequest(node, method, params = []) {
        const id = Math.floor(Math.random() * 1000000);
        const payload = {
            jsonrpc: '2.0',
            method,
            params,
            id
        };
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        try {
            const response = await fetch(node, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'User-Agent': 'HiveTS/1.0.0'
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                let errorText = '';
                try {
                    errorText = await response.text();
                }
                catch (e) {
                    errorText = 'Unable to read error response';
                }
                throw new HiveError(`HTTP ${response.status}: ${response.statusText}${errorText ? ' - ' + errorText : ''}`);
            }
            let data;
            try {
                data = await response.json();
            }
            catch (e) {
                throw new HiveError('Invalid JSON response from server');
            }
            if (data.error) {
                throw new HiveError(data.error.message || 'Unknown server error', data.error.code, data.error.data);
            }
            if (data.result === undefined) {
                throw new HiveError('Server returned empty result');
            }
            return data.result;
        }
        catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof HiveError) {
                throw error;
            }
            if (error instanceof Error && error.name === 'AbortError') {
                throw new HiveError(`Request timeout after ${this.timeout}ms`);
            }
            throw new HiveError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Delay utility for retry logic
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Get current active node information
     */
    getCurrentNode() {
        return this.getAllNodes()[this.currentNodeIndex];
    }
    /**
     * Get all configured nodes
     */
    getConfiguredNodes() {
        return this.getAllNodes();
    }
    /**
     * Get dynamic global properties
     */
    async getDynamicGlobalProperties() {
        return this.call('condenser_api.get_dynamic_global_properties', []);
    }
    /**
     * Broadcast transaction
     */
    async broadcastTransaction(transaction) {
        return this.call('condenser_api.broadcast_transaction', [transaction]);
    }
    /**
     * Broadcast transaction synchronously (alternative method)
     */
    async broadcastTransactionSynchronous(transaction) {
        return this.call('condenser_api.broadcast_transaction_synchronous', [transaction]);
    }
    /**
     * Get account information using condenser_api.get_accounts
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