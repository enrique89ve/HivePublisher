/**
 * Main Hive client for blockchain communication
 */

import { HiveConfig, HiveResponse, DynamicGlobalProperties, HiveError } from './types.js';

export class HiveClient {
  private apiNode: string;
  private timeout: number;

  constructor(config: HiveConfig = {}) {
    this.apiNode = config.apiNode || 'https://api.hive.blog';
    this.timeout = config.timeout || 10000;
  }

  /**
   * Make RPC call to Hive API
   */
  async call<T = any>(method: string, params: any[] = []): Promise<T> {
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
        throw new HiveError(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: HiveResponse<T> = await response.json();

      if (data.error) {
        throw new HiveError(
          data.error.message,
          data.error.code,
          data.error.data
        );
      }

      return data.result;
    } catch (error) {
      if (error instanceof HiveError) {
        throw error;
      }
      throw new HiveError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get dynamic global properties
   */
  async getDynamicGlobalProperties(): Promise<DynamicGlobalProperties> {
    return this.call('condenser_api.get_dynamic_global_properties');
  }

  /**
   * Broadcast transaction
   */
  async broadcastTransaction(transaction: any): Promise<any> {
    return this.call('condenser_api.broadcast_transaction', [transaction]);
  }

  /**
   * Get account information
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
   * Get detailed account information
   */
  async getAccountInfo(username: string): Promise<any> {
    return this.call('condenser_api.get_accounts', [[username]]);
  }
}
