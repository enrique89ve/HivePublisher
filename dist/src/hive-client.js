/**
 * Main Hive client for blockchain communication
 */
import { HiveError } from './types.js';
export class HiveClient {
    constructor(config = {}) {
        this.currentNodeIndex = 0;
        this.nodeHealthStatus = new Map();
        this.enableRestApi = false;
        this.taposCache = {
            head_block_id: '',
            head_block_time: new Date(),
            cached_at: 0
        };
        this.mainnet = config.mainnet !== false; // Default to mainnet
        this.timeout = config.timeout || 10000;
        this.maxRetries = config.maxRetries || 3;
        this.enableRestApi = config.enableRestApi || false;
        this.requestInterceptor = config.requestInterceptor;
        this.responseInterceptor = config.responseInterceptor;
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
     * Optimized list based on WAX patterns and proven reliability
     */
    getDefaultFallbackNodes() {
        if (this.mainnet) {
            return [
                'https://rpc.mahdiyari.info', // High reliability, fast response
                'https://hived.emre.sh', // Community favorite
                'https://api.deathwing.me', // Stable endpoint
                'https://hive-api.arcange.eu', // European node
                'https://api.openhive.network', // Official backup
                'https://anyx.io', // Additional reliability
                'https://techcoderx.com' // Community node
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
     * Make a single request to a specific node with WAX-inspired interceptors
     */
    async makeRequest(node, method, params = []) {
        const id = Math.floor(Math.random() * 1000000);
        let requestConfig = {
            url: node,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'HiveTS/1.0.0'
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method,
                params,
                id
            }),
            timeout: this.timeout
        };
        // Apply request interceptor (WAX pattern)
        if (this.requestInterceptor) {
            requestConfig = await this.requestInterceptor(requestConfig);
        }
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), requestConfig.timeout);
        try {
            const response = await fetch(requestConfig.url, {
                method: requestConfig.method,
                headers: requestConfig.headers,
                body: requestConfig.body,
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
            let result = data.result;
            // Apply response interceptor (WAX pattern)
            if (this.responseInterceptor) {
                result = await this.responseInterceptor(result);
            }
            return result;
        }
        catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof HiveError) {
                throw error;
            }
            if (error instanceof Error && error.name === 'AbortError') {
                throw new HiveError(`Request timeout after ${requestConfig.timeout}ms`);
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
     * Check node health with caching (WAX-inspired pattern)
     */
    async checkNodeHealth(node) {
        const cached = this.nodeHealthStatus.get(node);
        const now = Date.now();
        // Use cached result if less than 30 seconds old
        if (cached && (now - cached.lastCheck) < 30000) {
            return cached.healthy;
        }
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // Short timeout for health check
            const response = await fetch(node, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'User-Agent': 'HiveTS/1.0.0'
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'condenser_api.get_dynamic_global_properties',
                    params: [],
                    id: 1
                }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            const healthy = response.ok;
            this.nodeHealthStatus.set(node, { healthy, lastCheck: now });
            return healthy;
        }
        catch (error) {
            this.nodeHealthStatus.set(node, { healthy: false, lastCheck: now });
            return false;
        }
    }
    /**
     * Get healthy nodes prioritized by current preference
     */
    async getHealthyNodes() {
        const allNodes = this.getAllNodes();
        const healthChecks = await Promise.all(allNodes.map(async (node) => ({
            node,
            healthy: await this.checkNodeHealth(node)
        })));
        return healthChecks
            .filter(check => check.healthy)
            .map(check => check.node);
    }
    /**
     * Get node health status for monitoring
     */
    getNodeHealthStatus() {
        const status = {};
        for (const [node, health] of this.nodeHealthStatus.entries()) {
            status[node] = { ...health };
        }
        return status;
    }
    /**
     * WAX-inspired extension system for adding custom functionality
     */
    extend(extensions) {
        return Object.assign(this, extensions);
    }
    /**
     * WAX-inspired proxy support with custom interceptors
     */
    withProxy(requestInterceptor, responseInterceptor) {
        const newClient = new HiveClient({
            apiNode: this.apiNode,
            fallbackNodes: this.fallbackNodes,
            timeout: this.timeout,
            mainnet: this.mainnet,
            maxRetries: this.maxRetries,
            enableRestApi: this.enableRestApi,
            requestInterceptor,
            responseInterceptor
        });
        return newClient;
    }
    /**
     * Get cached TAPOS data with intelligent refresh (WAX pattern)
     */
    async getTaposCache() {
        const now = Date.now();
        const cacheAge = now - this.taposCache.cached_at;
        // Refresh cache if older than 30 seconds or empty
        if (cacheAge > 30000 || !this.taposCache.head_block_id) {
            try {
                const globalProps = await this.getDynamicGlobalProperties();
                this.taposCache = {
                    head_block_id: globalProps.head_block_id,
                    head_block_time: new Date(globalProps.time + 'Z'),
                    cached_at: now
                };
            }
            catch (error) {
                // Return cached data if refresh fails
                if (this.taposCache.head_block_id) {
                    return {
                        head_block_id: this.taposCache.head_block_id,
                        head_block_time: this.taposCache.head_block_time
                    };
                }
                throw error;
            }
        }
        return {
            head_block_id: this.taposCache.head_block_id,
            head_block_time: this.taposCache.head_block_time
        };
    }
    /**
     * Advanced node performance metrics (WAX-inspired)
     */
    async getNodeMetrics() {
        const nodes = this.getAllNodes();
        const metrics = {};
        const checks = await Promise.allSettled(nodes.map(async (node) => {
            const startTime = Date.now();
            try {
                const response = await this.makeRequest(node, 'condenser_api.get_dynamic_global_properties', []);
                const latency = Date.now() - startTime;
                return {
                    node,
                    healthy: true,
                    latency,
                    blockHeight: response.head_block_number,
                    lastCheck: Date.now()
                };
            }
            catch (error) {
                return {
                    node,
                    healthy: false,
                    latency: -1,
                    blockHeight: -1,
                    lastCheck: Date.now()
                };
            }
        }));
        checks.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                const data = result.value;
                metrics[data.node] = {
                    healthy: data.healthy,
                    latency: data.latency,
                    blockHeight: data.blockHeight,
                    lastCheck: data.lastCheck
                };
            }
            else {
                metrics[nodes[index]] = {
                    healthy: false,
                    latency: -1,
                    blockHeight: -1,
                    lastCheck: Date.now()
                };
            }
        });
        return metrics;
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