/**
 * Cryptographic utilities for Hive blockchain operations
 * Using hive-tx library for reliable transaction signing
 */
import { PrivateKey } from 'hive-tx';
import { HiveError } from './types.js';
/**
 * Parse WIF (Wallet Import Format) private key using hive-tx
 *
 * @param privateKeyWif - WIF-formatted private key string
 * @returns PrivateKey instance for transaction signing
 * @throws HiveError if key format is invalid
 */
export function parsePrivateKey(privateKeyWif) {
    try {
        return PrivateKey.from(privateKeyWif);
    }
    catch (error) {
        throw new HiveError(`Invalid private key format: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
//# sourceMappingURL=crypto.js.map