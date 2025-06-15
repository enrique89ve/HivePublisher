/**
 * Cryptographic utilities for Hive blockchain operations
 * Minimal implementation using hive-tx library for transaction signing
 */
import { PrivateKey } from 'hive-tx';
/**
 * Parse WIF (Wallet Import Format) private key using hive-tx
 *
 * @param privateKeyWif - WIF-formatted private key string
 * @returns PrivateKey instance for transaction signing
 * @throws HiveError if key format is invalid
 */
export declare function parsePrivateKey(privateKeyWif: string): PrivateKey;
/**
 * Sign transaction using hive-tx library
 *
 * @param transaction - Transaction object to sign
 * @param privateKey - PrivateKey instance for signing
 * @returns Signature string for the transaction
 */
export declare function signTransaction(transaction: any, privateKey: PrivateKey): string;
/**
 * Generate transaction ID from transaction object
 *
 * @param transaction - Transaction object
 * @returns Promise resolving to transaction ID string
 */
export declare function generateTransactionId(transaction: any): Promise<string>;
//# sourceMappingURL=crypto.d.ts.map