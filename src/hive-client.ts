/**
 * Main Hive client for blockchain communication
 */

import { HiveConfig, HiveResponse, DynamicGlobalProperties, HiveError } from './types.js';

export class HiveClient {
  private apiNode: string;
  private timeout: number;

  constructor(config: HiveConfig = {}) {
    this.apiNode = config.apiNode || 'https://rpc.mahdiyari.info';
    this.timeout = config.timeout || 10000;
  }

  /**
   * Make RPC call to Hive API with proper error handling and request configuration
   */
  async call<T = any>(method: string, params: any = []): Promise<T> {
    // Ensure consistent ID generation
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
      const response = await fetch(this.apiNode, {
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
