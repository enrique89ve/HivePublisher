/**
 * Hive blockchain account operations
 * Based on HAF SQL implementation for comprehensive account data
 */
import { HiveClient } from './hive-client.js';
import { AccountInfo } from './types.js';
/**
 * Get complete account information from Hive blockchain
 *
 * @param username - Hive username to retrieve information for
 * @param client - Optional HiveClient instance for custom configuration
 * @returns Promise resolving to AccountInfo object or null if account not found
 *
 * @example
 * ```typescript
 * const account = await getAccountInfo('alice');
 * if (account) {
 *   console.log(`Reputation: ${account.reputation}`);
 *   console.log(`Posts: ${account.total_posts}`);
 *   console.log(`Followers: ${account.followers}`);
 * }
 * ```
 */
export declare function getAccountInfo(username: string, client?: HiveClient): Promise<AccountInfo | null>;
//# sourceMappingURL=accounts.d.ts.map