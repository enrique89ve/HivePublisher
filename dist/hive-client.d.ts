/**
 * Elite-level Hive client for blockchain communication
 * Implements advanced patterns: Circuit Breaker, Pool Management, Event System, Smart Caching
 */
import { HiveConfig, DynamicGlobalProperties, RequestInterceptor, ResponseInterceptor } from './types.js';
type EventCallback<T = any> = (data: T) => void;
type PerformanceMetrics = {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageLatency: number;
    lastError?: Error;
    uptime: number;
};
type NodeHealth = {
    healthy: boolean;
    latency: number;
    blockHeight: number;
    lastCheck: number;
    consecutiveFailures: number;
    isCircuitOpen: boolean;
};
export declare class HiveClient {
    private readonly apiNode;
    private readonly fallbackNodes;
    private readonly timeout;
    private readonly mainnet;
    private readonly maxRetries;
    private currentNodeIndex;
    private readonly nodeHealthStatus;
    private readonly eventListeners;
    private readonly metrics;
    private readonly cache;
    private readonly connectionPool;
    private readonly requestInterceptor?;
    private readonly responseInterceptor?;
    private readonly enableRestApi;
    private taposCache;
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
     * Get the currently selected API node
     */
    getCurrentNode(): string;
    /**
     * Get all configured nodes (primary + fallbacks)
     */
    getConfiguredNodes(): string[];
    /**
     * Elite RPC call with circuit breaker, smart caching, and advanced failover
     */
    call<T = any>(method: string, params?: any): Promise<T>;
    /**
     * Elite Pattern: Circuit breaker aware request
     */
    private makeRequestWithCircuitBreaker;
    /**
     * Elite Pattern: Smart node selection with weighted load balancing
     */
    private selectOptimalNode;
    /**
     * Elite Pattern: Smart backoff calculation with jitter
     */
    private calculateBackoff;
    /**
     * Get available nodes excluding circuits that are open
     */
    private getAvailableNodes;
    /**
     * Determine if method is read-only for caching
     */
    private isReadOperation;
    /**
     * Make a single request to a specific node with WAX-inspired interceptors
     */
    private makeRequest;
    /**
     * Delay utility for retry logic
     */
    private delay;
    /**
     * Elite Pattern: Enhanced node health check with full metrics
     */
    private checkNodeHealth;
    /**
     * Get healthy nodes prioritized by current preference
     */
    getHealthyNodes(): Promise<string[]>;
    /**
     * Get node health status for monitoring with enhanced metrics
     */
    getNodeHealthStatus(): Record<string, NodeHealth>;
    /**
     * WAX-inspired extension system for adding custom functionality
     */
    extend<T>(extensions: T): this & T;
    /**
     * WAX-inspired proxy support with custom interceptors
     */
    withProxy(requestInterceptor: RequestInterceptor, responseInterceptor: ResponseInterceptor): HiveClient;
    /**
     * Get cached TAPOS data with intelligent refresh (WAX pattern)
     */
    getTaposCache(): Promise<{
        head_block_id: string;
        head_block_time: Date;
    }>;
    /**
     * Elite Pattern: Enhanced node performance metrics
     */
    getNodeMetrics(): Promise<Record<string, {
        healthy: boolean;
        latency: number;
        blockHeight: number;
        lastCheck: number;
        consecutiveFailures: number;
        isCircuitOpen: boolean;
    }>>;
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
    /**
     * Elite Pattern: Event system for observability
     */
    on<T = any>(event: string, callback: EventCallback<T>): void;
    off(event: string, callback?: EventCallback): void;
    private emit;
    /**
     * Elite Pattern: Circuit breaker implementation
     */
    private isCircuitOpen;
    private updateCircuitBreakerState;
    /**
     * Elite Pattern: Performance metrics collection
     */
    getPerformanceMetrics(): PerformanceMetrics & {
        uptimeString: string;
    };
    private updateMetrics;
    /**
     * Elite Pattern: Smart caching with TTL
     */
    private getCached;
    private setCache;
    /**
     * Elite Pattern: Connection pool management
     */
    initializeConnectionPool(): void;
    /**
     * Elite Pattern: Dynamic node weight adjustment based on performance
     */
    adjustNodeWeights(): void;
    /**
     * Elite Pattern: Auto-optimization based on network conditions
     */
    optimize(): Promise<void>;
    /**
     * Elite Pattern: Graceful shutdown with cleanup
     */
    shutdown(): Promise<void>;
    /**
     * Elite Pattern: Health monitoring with auto-recovery
     */
    startHealthMonitoring(intervalMs?: number): () => void;
    /**
     * Initialize health monitoring for circuit breaker patterns
     * Sets up initial health state for all nodes
     */
    private initializeHealthMonitoring;
    /**
     * Static factory method for even simpler creation
     * @example
     * const client = HiveClient.create(); // Mainnet with all defaults
     * const client = HiveClient.create({ mainnet: false }); // Testnet
     */
    static create(config?: HiveConfig): HiveClient;
    /**
     * Create a mainnet client with express setup
     * @example
     * const client = HiveClient.mainnet(); // Ready to use immediately
     */
    static mainnet(config?: Omit<HiveConfig, 'mainnet'>): HiveClient;
    /**
     * Create a testnet client with express setup
     * @example
     * const client = HiveClient.testnet(); // For testing and development
     */
    static testnet(config?: Omit<HiveConfig, 'mainnet'>): HiveClient;
}
export {};
//# sourceMappingURL=hive-client.d.ts.map