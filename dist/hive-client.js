"use strict";
/**
 * Elite-level Hive client for blockchain communication
 * Implements advanced patterns: Circuit Breaker, Pool Management, Event System, Smart Caching
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HiveClient = void 0;
const types_js_1 = require("./types.js");
// Circuit breaker configuration
const CIRCUIT_BREAKER_CONFIG = {
    failureThreshold: 5,
    resetTimeout: 30000,
    halfOpenMaxCalls: 3,
};
class HiveClient {
    /**
     * Creates a new HiveClient with smart defaults
     *
     * @example
     * // Simple mode - everything configured automatically
     * const client = new HiveClient();
     *
     * @example
     * // Custom mode - override only what you need
     * const client = new HiveClient({
     *   apiNode: 'https://my-custom-node.com',
     *   timeout: 5000
     * });
     */
    constructor(config = {}) {
        this.currentNodeIndex = 0;
        // Elite patterns: Advanced health tracking with circuit breaker
        this.nodeHealthStatus = new Map();
        // Event system for observability
        this.eventListeners = new Map();
        // Performance metrics
        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageLatency: 0,
            uptime: Date.now(),
        };
        // Smart caching with TTL
        this.cache = new Map();
        // Connection pool with load balancing
        this.connectionPool = new Map();
        this.enableRestApi = false;
        // Enhanced TAPOS cache with better invalidation
        this.taposCache = {
            head_block_id: '',
            head_block_time: new Date(),
            cached_at: 0,
        };
        // Smart defaults with automatic configuration
        this.mainnet = config.mainnet !== false; // Default to mainnet unless explicitly set to false
        this.timeout = config.timeout ?? 10000; // 10 second default timeout
        this.maxRetries = config.maxRetries ?? 3; // 3 retries by default
        this.enableRestApi = config.enableRestApi ?? false; // REST API disabled by default
        this.requestInterceptor = config.requestInterceptor;
        this.responseInterceptor = config.responseInterceptor;
        // Auto-configure nodes with intelligent defaults
        this.apiNode = config.apiNode ?? this.getDefaultApiNode();
        this.fallbackNodes = config.fallbackNodes ?? this.getDefaultFallbackNodes();
        // Initialize connection pool for all nodes
        this.initializeConnectionPool();
        // Setup health monitoring for elite patterns
        this.initializeHealthMonitoring();
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
                'https://techcoderx.com', // Community node
            ];
        }
        else {
            return ['https://testnet.openhive.network'];
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
     * Get the currently selected API node
     */
    getCurrentNode() {
        return this.apiNode;
    }
    /**
     * Get all configured nodes (primary + fallbacks)
     */
    getConfiguredNodes() {
        return [this.apiNode, ...this.fallbackNodes];
    }
    /**
     * Elite RPC call with circuit breaker, smart caching, and advanced failover
     */
    async call(method, params = []) {
        const cacheKey = `${method}:${JSON.stringify(params)}`;
        const startTime = Date.now();
        // Elite Pattern: Smart caching for read operations
        if (this.isReadOperation(method)) {
            const cached = this.getCached(cacheKey);
            if (cached) {
                this.emit('cache-hit', { method, params });
                return cached;
            }
        }
        const availableNodes = this.getAvailableNodes();
        if (availableNodes.length === 0) {
            throw new types_js_1.HiveError('No healthy nodes available - all circuits are open');
        }
        let lastError = null;
        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            // Select node: primary for first attempt, optimal balancing thereafter
            let selectedNode;
            if (attempt === 0) {
                selectedNode = this.apiNode;
            }
            else {
                selectedNode = this.selectOptimalNode(availableNodes);
            }
            try {
                const result = await this.makeRequestWithCircuitBreaker(selectedNode, method, params);
                // Update metrics and cache
                const latency = Date.now() - startTime;
                this.updateMetrics(true, latency);
                this.updateCircuitBreakerState(selectedNode, true);
                // Cache successful read operations
                if (this.isReadOperation(method)) {
                    this.setCache(cacheKey, result);
                }
                this.emit('request-success', { method, params, node: selectedNode, latency });
                return result;
            }
            catch (error) {
                lastError = error;
                const latency = Date.now() - startTime;
                this.updateMetrics(false, latency, lastError);
                this.updateCircuitBreakerState(selectedNode, false);
                this.emit('request-error', {
                    method,
                    params,
                    node: selectedNode,
                    error: lastError,
                    latency,
                });
                if (process.env.NODE_ENV === 'development') {
                    console.log(`[HiveTS Elite] Node ${selectedNode} failed: ${lastError.message}`);
                }
            }
            // Elite Pattern: Exponential backoff with jitter
            if (attempt < this.maxRetries - 1) {
                const backoffMs = this.calculateBackoff(attempt);
                await this.delay(backoffMs);
            }
        }
        throw new types_js_1.HiveError(`All available nodes failed after ${this.maxRetries} attempts. Last error: ${lastError?.message || 'Unknown error'}`);
    }
    /**
     * Elite Pattern: Circuit breaker aware request
     */
    async makeRequestWithCircuitBreaker(node, method, params = []) {
        // Check circuit breaker
        if (this.isCircuitOpen(node)) {
            throw new types_js_1.HiveError(`Circuit breaker is open for node: ${node}`);
        }
        return this.makeRequest(node, method, params);
    }
    /**
     * Elite Pattern: Smart node selection with weighted load balancing
     */
    selectOptimalNode(availableNodes) {
        if (availableNodes.length === 1)
            return availableNodes[0];
        // Weight nodes by health metrics (latency, success rate)
        const weightedNodes = availableNodes.map(node => {
            const health = this.nodeHealthStatus.get(node);
            const pool = this.connectionPool.get(node) || { weight: 1, activeConnections: 0 };
            let weight = pool.weight;
            // Penalize high latency
            if (health && health.latency > 0) {
                weight *= Math.max(0.1, 1 - health.latency / 5000); // 5s max penalty
            }
            // Penalize high active connections
            weight *= Math.max(0.1, 1 - pool.activeConnections / 10); // 10 max connections
            return { node, weight };
        });
        // Select node using weighted random selection
        const totalWeight = weightedNodes.reduce((sum, n) => sum + n.weight, 0);
        let random = Math.random() * totalWeight;
        for (const { node, weight } of weightedNodes) {
            random -= weight;
            if (random <= 0)
                return node;
        }
        // Fallback to first available
        return availableNodes[0];
    }
    /**
     * Elite Pattern: Smart backoff calculation with jitter
     */
    calculateBackoff(attempt) {
        const baseDelay = 1000;
        const exponentialDelay = baseDelay * Math.pow(2, attempt);
        const jitter = Math.random() * 0.3; // 30% jitter
        return exponentialDelay * (1 + jitter);
    }
    /**
     * Get available nodes excluding circuits that are open
     */
    getAvailableNodes() {
        return this.getAllNodes().filter(node => !this.isCircuitOpen(node));
    }
    /**
     * Determine if method is read-only for caching
     */
    isReadOperation(method) {
        const readMethods = [
            'get_dynamic_global_properties',
            'get_accounts',
            'get_content',
            'get_follow_count',
            'get_account_info',
        ];
        return readMethods.some(readMethod => method.includes(readMethod));
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
                Accept: 'application/json',
                'User-Agent': 'HiveTS/1.0.0',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method,
                params,
                id,
            }),
            timeout: this.timeout,
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
                signal: controller.signal,
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
                throw new types_js_1.HiveError(`HTTP ${response.status}: ${response.statusText}${errorText ? ' - ' + errorText : ''}`);
            }
            let data;
            try {
                const jsonData = (await response.json());
                data = jsonData;
            }
            catch (e) {
                throw new types_js_1.HiveError('Invalid JSON response from server');
            }
            if (data.error) {
                throw new types_js_1.HiveError(data.error.message || 'Unknown server error', String(data.error.code || 'UNKNOWN'), data.error.data);
            }
            if (data.result === undefined) {
                throw new types_js_1.HiveError('Server returned empty result');
            }
            let result = data.result;
            if (this.responseInterceptor) {
                const interceptedResult = await this.responseInterceptor(result);
                return interceptedResult;
            }
            return result;
        }
        catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof types_js_1.HiveError) {
                throw error;
            }
            if (error instanceof Error && error.name === 'AbortError') {
                throw new types_js_1.HiveError(`Request timeout after ${requestConfig.timeout}ms`);
            }
            throw new types_js_1.HiveError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Delay utility for retry logic
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Elite Pattern: Enhanced node health check with full metrics
     */
    async checkNodeHealth(node) {
        const cached = this.nodeHealthStatus.get(node);
        const now = Date.now();
        // Use cached result if less than 30 seconds old
        if (cached && now - cached.lastCheck < 30000) {
            return cached.healthy;
        }
        const startTime = Date.now();
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            const response = await fetch(node, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'User-Agent': 'HiveTS/1.0.0',
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'condenser_api.get_dynamic_global_properties',
                    params: [],
                    id: 1,
                }),
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            const latency = Date.now() - startTime;
            const healthy = response.ok;
            let blockHeight = -1;
            if (healthy) {
                try {
                    const data = (await response.json());
                    if (data.result?.head_block_number) {
                        blockHeight = data.result.head_block_number;
                    }
                }
                catch {
                    // Ignore JSON parsing errors for health check
                }
            }
            const nodeHealth = {
                healthy,
                latency,
                blockHeight,
                lastCheck: now,
                consecutiveFailures: cached?.consecutiveFailures || 0,
                isCircuitOpen: cached?.isCircuitOpen || false,
            };
            this.nodeHealthStatus.set(node, nodeHealth);
            return healthy;
        }
        catch (error) {
            const nodeHealth = {
                healthy: false,
                latency: Date.now() - startTime,
                blockHeight: -1,
                lastCheck: now,
                consecutiveFailures: (cached?.consecutiveFailures || 0) + 1,
                isCircuitOpen: cached?.isCircuitOpen || false,
            };
            this.nodeHealthStatus.set(node, nodeHealth);
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
            healthy: await this.checkNodeHealth(node),
        })));
        return healthChecks.filter(check => check.healthy).map(check => check.node);
    }
    /**
     * Get node health status for monitoring with enhanced metrics
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
            responseInterceptor,
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
                    cached_at: now,
                };
            }
            catch (error) {
                // Return cached data if refresh fails
                if (this.taposCache.head_block_id) {
                    return {
                        head_block_id: this.taposCache.head_block_id,
                        head_block_time: this.taposCache.head_block_time,
                    };
                }
                throw error;
            }
        }
        return {
            head_block_id: this.taposCache.head_block_id,
            head_block_time: this.taposCache.head_block_time,
        };
    }
    /**
     * Elite Pattern: Enhanced node performance metrics
     */
    async getNodeMetrics() {
        const nodes = this.getAllNodes();
        const metrics = {};
        const checks = await Promise.allSettled(nodes.map(async (node) => {
            const startTime = Date.now();
            try {
                const response = await this.makeRequest(node, 'condenser_api.get_dynamic_global_properties', []);
                const latency = Date.now() - startTime;
                const existing = this.nodeHealthStatus.get(node);
                return {
                    node,
                    health: {
                        healthy: true,
                        latency,
                        blockHeight: response.head_block_number,
                        lastCheck: Date.now(),
                        consecutiveFailures: 0,
                        isCircuitOpen: false,
                    },
                };
            }
            catch (error) {
                const existing = this.nodeHealthStatus.get(node);
                return {
                    node,
                    health: {
                        healthy: false,
                        latency: Date.now() - startTime,
                        blockHeight: -1,
                        lastCheck: Date.now(),
                        consecutiveFailures: (existing?.consecutiveFailures || 0) + 1,
                        isCircuitOpen: existing?.isCircuitOpen || false,
                    },
                };
            }
        }));
        checks.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                const data = result.value;
                metrics[data.node] = data.health;
                this.nodeHealthStatus.set(data.node, data.health);
            }
            else {
                const node = nodes[index];
                const existing = this.nodeHealthStatus.get(node);
                metrics[node] = {
                    healthy: false,
                    latency: -1,
                    blockHeight: -1,
                    lastCheck: Date.now(),
                    consecutiveFailures: (existing?.consecutiveFailures || 0) + 1,
                    isCircuitOpen: existing?.isCircuitOpen || false,
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
    /**
     * Elite Pattern: Event system for observability
     */
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }
    off(event, callback) {
        const listeners = this.eventListeners.get(event);
        if (!listeners)
            return;
        if (callback) {
            const index = listeners.indexOf(callback);
            if (index > -1)
                listeners.splice(index, 1);
        }
        else {
            this.eventListeners.delete(event);
        }
    }
    emit(event, data) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(data);
                }
                catch (error) {
                    console.error(`Event listener error for ${event}:`, error);
                }
            });
        }
    }
    /**
     * Elite Pattern: Circuit breaker implementation
     */
    isCircuitOpen(node) {
        const health = this.nodeHealthStatus.get(node);
        if (!health)
            return false;
        return health.isCircuitOpen;
    }
    updateCircuitBreakerState(node, success) {
        const current = this.nodeHealthStatus.get(node);
        if (!current)
            return;
        if (success) {
            // Reset circuit on success
            current.consecutiveFailures = 0;
            current.isCircuitOpen = false;
        }
        else {
            current.consecutiveFailures++;
            // Open circuit if threshold exceeded
            if (current.consecutiveFailures >= CIRCUIT_BREAKER_CONFIG.failureThreshold) {
                current.isCircuitOpen = true;
                // Auto-reset circuit after timeout
                setTimeout(() => {
                    const health = this.nodeHealthStatus.get(node);
                    if (health) {
                        health.isCircuitOpen = false;
                        health.consecutiveFailures = 0;
                    }
                }, CIRCUIT_BREAKER_CONFIG.resetTimeout);
                this.emit('circuit-breaker-opened', {
                    node,
                    consecutiveFailures: current.consecutiveFailures,
                });
            }
        }
    }
    /**
     * Elite Pattern: Performance metrics collection
     */
    getPerformanceMetrics() {
        const uptimeMs = Date.now() - this.metrics.uptime;
        const uptimeMinutes = Math.floor(uptimeMs / 60000);
        const uptimeHours = Math.floor(uptimeMinutes / 60);
        const uptimeString = `${uptimeHours}h ${uptimeMinutes % 60}m`;
        return {
            ...this.metrics,
            uptimeString,
        };
    }
    updateMetrics(success, latency, error) {
        this.metrics.totalRequests++;
        if (success) {
            this.metrics.successfulRequests++;
        }
        else {
            this.metrics.failedRequests++;
            this.metrics.lastError = error;
        }
        // Update rolling average latency
        const totalLatency = this.metrics.averageLatency * (this.metrics.totalRequests - 1) + latency;
        this.metrics.averageLatency = totalLatency / this.metrics.totalRequests;
    }
    /**
     * Elite Pattern: Smart caching with TTL
     */
    getCached(key) {
        const cached = this.cache.get(key);
        if (!cached)
            return null;
        if (Date.now() > cached.expires) {
            this.cache.delete(key);
            return null;
        }
        return cached.data;
    }
    setCache(key, data, ttlMs = 30000) {
        this.cache.set(key, {
            data,
            expires: Date.now() + ttlMs,
        });
    }
    /**
     * Elite Pattern: Connection pool management
     */
    initializeConnectionPool() {
        this.getAllNodes().forEach(node => {
            if (!this.connectionPool.has(node)) {
                this.connectionPool.set(node, { weight: 1.0, activeConnections: 0 });
            }
        });
    }
    /**
     * Elite Pattern: Dynamic node weight adjustment based on performance
     */
    adjustNodeWeights() {
        for (const [node, health] of this.nodeHealthStatus.entries()) {
            const pool = this.connectionPool.get(node);
            if (!pool)
                continue;
            // Adjust weight based on health metrics
            let newWeight = 1.0;
            if (!health.healthy) {
                newWeight = 0.1; // Heavily penalize unhealthy nodes
            }
            else {
                // Performance-based weight adjustment
                if (health.latency > 0 && health.latency < 1000) {
                    newWeight = Math.max(0.1, 1 - health.latency / 2000); // Linear decay up to 2s
                }
                else if (health.latency >= 1000) {
                    newWeight = 0.2; // High latency penalty
                }
            }
            pool.weight = newWeight;
        }
    }
    /**
     * Elite Pattern: Auto-optimization based on network conditions
     */
    async optimize() {
        await this.getNodeMetrics(); // Refresh all metrics
        this.adjustNodeWeights();
        this.emit('optimization-complete', this.getPerformanceMetrics());
    }
    /**
     * Elite Pattern: Graceful shutdown with cleanup
     */
    async shutdown() {
        this.emit('shutdown-started', {});
        // Clear all caches
        this.cache.clear();
        // Reset circuit breakers
        for (const [node, health] of this.nodeHealthStatus.entries()) {
            health.isCircuitOpen = false;
            health.consecutiveFailures = 0;
        }
        // Clear event listeners
        this.eventListeners.clear();
        this.emit('shutdown-complete', {});
    }
    /**
     * Elite Pattern: Health monitoring with auto-recovery
     */
    startHealthMonitoring(intervalMs = 60000) {
        const interval = setInterval(async () => {
            try {
                await this.optimize();
                const metrics = this.getPerformanceMetrics();
                const healthyNodes = Object.values(this.getNodeHealthStatus()).filter(health => health.healthy).length;
                this.emit('health-check', {
                    timestamp: new Date().toISOString(),
                    healthyNodes,
                    totalNodes: this.getAllNodes().length,
                    metrics,
                });
            }
            catch (error) {
                this.emit('health-check-error', { error });
            }
        }, intervalMs);
        return () => clearInterval(interval);
    }
    /**
     * Initialize health monitoring for circuit breaker patterns
     * Sets up initial health state for all nodes
     */
    initializeHealthMonitoring() {
        const allNodes = this.getAllNodes();
        for (const node of allNodes) {
            this.nodeHealthStatus.set(node, {
                healthy: true,
                latency: 0,
                blockHeight: 0,
                lastCheck: 0,
                consecutiveFailures: 0,
                isCircuitOpen: false,
            });
        }
        // Emit initialization complete event
        this.emit('health-monitoring-initialized', {
            nodeCount: allNodes.length,
            nodes: allNodes,
        });
    }
    /**
     * Static factory method for even simpler creation
     * @example
     * const client = HiveClient.create(); // Mainnet with all defaults
     * const client = HiveClient.create({ mainnet: false }); // Testnet
     */
    static create(config = {}) {
        return new HiveClient(config);
    }
    /**
     * Create a mainnet client with express setup
     * @example
     * const client = HiveClient.mainnet(); // Ready to use immediately
     */
    static mainnet(config = {}) {
        return new HiveClient({ ...config, mainnet: true });
    }
    /**
     * Create a testnet client with express setup
     * @example
     * const client = HiveClient.testnet(); // For testing and development
     */
    static testnet(config = {}) {
        return new HiveClient({ ...config, mainnet: false });
    }
}
exports.HiveClient = HiveClient;
//# sourceMappingURL=hive-client.js.map