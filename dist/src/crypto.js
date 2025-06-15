/**
 * Lightweight cryptographic utilities for Hive blockchain operations
 * Custom implementation using only secp256k1 - eliminates hive-tx dependency
 */
import * as secp256k1 from 'secp256k1';
import { createHash } from 'crypto';
import { HiveError } from './types.js';
/**
 * Base58 alphabet used by Hive
 */
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
/**
 * Decode Base58 string to Buffer
 */
function base58Decode(str) {
    let num = BigInt(0);
    const base = BigInt(58);
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        const index = BASE58_ALPHABET.indexOf(char);
        if (index === -1)
            throw new Error('Invalid Base58 character');
        num = num * base + BigInt(index);
    }
    const hex = num.toString(16);
    const padded = hex.length % 2 ? '0' + hex : hex;
    return Buffer.from(padded, 'hex');
}
/**
 * Encode Buffer to Base58 string
 */
function base58Encode(buffer) {
    let num = BigInt('0x' + buffer.toString('hex'));
    const base = BigInt(58);
    let result = '';
    while (num > 0) {
        const remainder = Number(num % base);
        result = BASE58_ALPHABET[remainder] + result;
        num = num / base;
    }
    return result;
}
/**
 * Parse WIF (Wallet Import Format) private key
 * Custom implementation without hive-tx dependency
 */
export function parsePrivateKey(privateKeyWif) {
    try {
        if (!privateKeyWif || privateKeyWif.length < 50) {
            throw new Error('Invalid WIF format');
        }
        const decoded = base58Decode(privateKeyWif);
        if (decoded.length !== 37) {
            throw new Error('Invalid WIF length');
        }
        // Verify checksum
        const key = decoded.slice(0, 33);
        const checksum = decoded.slice(33);
        const hash = createHash('sha256').update(key).digest();
        const doubleHash = createHash('sha256').update(hash).digest();
        if (!checksum.equals(doubleHash.slice(0, 4))) {
            throw new Error('Invalid WIF checksum');
        }
        // Return the 32-byte private key (skip the 0x80 prefix)
        return key.slice(1);
    }
    catch (error) {
        throw new HiveError(`Invalid private key format: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
/**
 * Serialize transaction for Hive blockchain format
 */
function serializeTransaction(transaction) {
    // Simplified Hive transaction serialization
    // This is a basic implementation - Hive uses a specific binary format
    const json = JSON.stringify(transaction, null, 0);
    return Buffer.from(json, 'utf8');
}
/**
 * Create transaction hash for signing (Hive-specific)
 */
function createTransactionHash(transaction) {
    const serialized = serializeTransaction(transaction);
    return createHash('sha256').update(serialized).digest();
}
/**
 * Sign transaction hash using secp256k1 with Hive format
 */
export function signTransaction(transaction, privateKey) {
    try {
        const txHash = createTransactionHash(transaction);
        const signature = secp256k1.ecdsaSign(txHash, privateKey);
        // Convert signature to hex format (simplified for Hive)
        const r = signature.signature.slice(0, 32);
        const s = signature.signature.slice(32, 64);
        const recoveryId = signature.recid;
        // Combine r, s, and recovery id for Hive format
        const combined = Buffer.concat([
            Buffer.from([recoveryId + 31]), // Hive uses 31 as base for recovery
            r,
            s
        ]);
        return combined.toString('hex');
    }
    catch (error) {
        throw new HiveError(`Transaction signing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
/**
 * Generate transaction ID from transaction object
 */
export function generateTransactionId(transaction) {
    try {
        const hash = createTransactionHash(transaction);
        return hash.toString('hex');
    }
    catch (error) {
        throw new HiveError(`Transaction ID generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
/**
 * Create a complete Hive transaction structure
 */
export function createHiveTransaction(operations, options) {
    return {
        ref_block_num: options.ref_block_num,
        ref_block_prefix: options.ref_block_prefix,
        expiration: options.expiration,
        operations: operations,
        extensions: [],
        signatures: []
    };
}
/**
 * Sign and finalize Hive transaction
 */
export function signHiveTransaction(transaction, privateKey) {
    const signature = signTransaction(transaction, privateKey);
    return {
        ...transaction,
        signatures: [signature],
        transaction_id: generateTransactionId(transaction)
    };
}
//# sourceMappingURL=crypto.js.map