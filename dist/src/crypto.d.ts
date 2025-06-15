/**
 * Cryptographic utilities for Hive blockchain
 * Extracted minimal functions from hivedb
 */
import { PrivateKey } from 'hive-tx';
/**
 * Parse WIF (Wallet Import Format) private key using hive-tx
 */
export declare function parsePrivateKey(privateKeyWif: string): PrivateKey;
/**
 * Sign transaction using hive-tx library
 */
export declare function signTransaction(transaction: any, privateKey: PrivateKey): string;
/**
 * Generate transaction ID
 */
export declare function generateTransactionId(transaction: any): Promise<string>;
//# sourceMappingURL=crypto.d.ts.map