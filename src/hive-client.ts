/**
 * Main Hive client for blockchain communication
 */

import { HiveConfig, HiveResponse, DynamicGlobalProperties, HiveError } from './types.js';

export class HiveClient {
  private apiNode: string;
  private fallbackNodes: string[];
  private timeout: number;
  private mainnet: boolean;
  private maxRetries: number;
  private currentNodeIndex: number = 0;
  private nodeHealthStatus: Map<string, { healthy: boolean; lastCheck: number }> = new Map();

  constructor(config: HiveConfig = {}) {
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
  private getDefaultApiNode(): string {
    if (this.mainnet) {
      return 'https://api.hive.blog'; // Primary mainnet node
    } else {
      return 'https://testnet.openhive.network'; // Primary testnet node
    }
  }

  /**
   * Get default fallback nodes based on network configuration
   * Optimized list based on WAX patterns and proven reliability
   */
  private getDefaultFallbackNodes(): string[] {
    if (this.mainnet) {
      return [
        'https://rpc.mahdiyari.info',        // High reliability, fast response
        'https://hived.emre.sh',             // Community favorite
        'https://api.deathwing.me',          // Stable endpoint
        'https://hive-api.arcange.eu',       // European node
        'https://api.openhive.network',      // Official backup
        'https://anyx.io',                   // Additional reliability
        'https://techcoderx.com'             // Community node
      ];
    } else {
      return [
        'https://testnet.openhive.network'
      ];
    }
  }

  /**
   * Get all available nodes (primary + fallbacks)
   */
  private getAllNodes(): string[] {
    return [this.apiNode, ...this.fallbackNodes];
  }

  /**
   * Check if client is configured for mainnet
   */
  public isMainnet(): boolean {
    return this.mainnet;
  }

  /**
   * Get current network name
   */
  public getNetworkName(): string {
    return this.mainnet ? 'mainnet' : 'testnet';
  }

  /**
   * Make RPC call with automatic node failover and retry logic
   */
  async call<T = any>(method: string, params: any = []): Promise<T> {
    const allNodes = this.getAllNodes();
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      for (let nodeIndex = 0; nodeIndex < allNodes.length; nodeIndex++) {
        const currentNode = allNodes[(this.currentNodeIndex + nodeIndex) % allNodes.length];
        
        try {
          const result = await this.makeRequest<T>(currentNode, method, params);
          
          // Success - update current node index for future calls
          this.currentNodeIndex = (this.currentNodeIndex + nodeIndex) % allNodes.length;
          
          if (nodeIndex > 0 && process.env.NODE_ENV === 'development') {
            console.log(`[HiveTS] Switched to node: ${currentNode}`);
          }
          
          return result;
        } catch (error) {
          lastError = error as Error;
          
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
  private async makeRequest<T>(node: string, method: string, params: any = []): Promise<T> {
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
        } catch (e) {
          errorText = 'Unable to read error response';
        }
        throw new HiveError(`HTTP ${response.status}: ${response.statusText}${errorText ? ' - ' + errorText : ''}`);
      }

      let data: HiveResponse<T>;
      try {
        data = await response.json();
      } catch (e) {
        throw new HiveError('Invalid JSON response from server');
      }

      if (data.error) {
        throw new HiveError(
          data.error.message || 'Unknown server error',
          data.error.code,
          data.error.data
        );
      }

      if (data.result === undefined) {
        throw new HiveError('Server returned empty result');
      }

      return data.result;
    } catch (error: unknown) {
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
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current active node information
   */
  public getCurrentNode(): string {
    return this.getAllNodes()[this.currentNodeIndex];
  }

  /**
   * Get all configured nodes
   */
  public getConfiguredNodes(): string[] {
    return this.getAllNodes();
  }

  /**
   * Check node health with caching (WAX-inspired pattern)
   */
  private async checkNodeHealth(node: string): Promise<boolean> {
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
    } catch (error) {
      this.nodeHealthStatus.set(node, { healthy: false, lastCheck: now });
      return false;
    }
  }

  /**
   * Get healthy nodes prioritized by current preference
   */
  public async getHealthyNodes(): Promise<string[]> {
    const allNodes = this.getAllNodes();
    const healthChecks = await Promise.all(
      allNodes.map(async (node) => ({
        node,
        healthy: await this.checkNodeHealth(node)
      }))
    );

    return healthChecks
      .filter(check => check.healthy)
      .map(check => check.node);
  }

  /**
   * Get node health status for monitoring
   */
  public getNodeHealthStatus(): Record<string, { healthy: boolean; lastCheck: number }> {
    const status: Record<string, { healthy: boolean; lastCheck: number }> = {};
    for (const [node, health] of this.nodeHealthStatus.entries()) {
      status[node] = { ...health };
    }
    return status;
  }

  /**
   * Get dynamic global properties
   */
  async getDynamicGlobalProperties(): Promise<DynamicGlobalProperties> {
    return this.call('condenser_api.get_dynamic_global_properties', []);
  }

  /**
   * Broadcast transaction
   */
  async broadcastTransaction(transaction: any): Promise<any> {
    return this.call('condenser_api.broadcast_transaction', [transaction]);
  }

  /**
   * Broadcast transaction synchronously (alternative method)
   */
  async broadcastTransactionSynchronous(transaction: any): Promise<any> {
    return this.call('condenser_api.broadcast_transaction_synchronous', [transaction]);
  }

  /**
   * Get account information using condenser_api.get_accounts
   */
  async getAccount(username: string): Promise<any> {
    const accounts = await this.call('condenser_api.get_accounts', [[username]]);
    return accounts[0] || null;
  }

  /**
   * Get content (post/comment)
   */
  async getContent(author: string, permlink: string): Promise<any> {
    return this.call('condenser_api.get_content', [author, permlink]);
  }

  /**
   * Get follow count for an account
   */
  async getFollowCount(username: string): Promise<any> {
    try {
      return await this.call('follow_api.get_follow_count', [username]);
    } catch (error) {
      // Follow API might not be available on all nodes
      return { follower_count: 0, following_count: 0 };
    }
  }

  /**
   * Get detailed account information
   */
  async getAccountInfo(username: string): Promise<any> {
    return this.call('condenser_api.get_accounts', [[username]]);
  }
}
