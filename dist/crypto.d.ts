/**
 * Cryptographic utilities for Hive blockchain operations
 * Using hive-tx library for reliable transaction signing
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
//# sourceMappingURL=crypto.d.ts.map