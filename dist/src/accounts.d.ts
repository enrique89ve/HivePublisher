/**
 * Hive blockchain account operations
 */
import { HiveClient } from './hive-client.js';
import { AccountInfo } from './types.js';
/**
 * Get complete account information from Hive blockchain
 */
export declare function getAccountInfo(username: string, client?: HiveClient): Promise<AccountInfo | null>;
//# sourceMappingURL=accounts.d.ts.map