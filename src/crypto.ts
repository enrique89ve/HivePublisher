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
function base58Decode(str: string): Buffer {
  let num = BigInt(0);
  const base = BigInt(58);
  
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const index = BASE58_ALPHABET.indexOf(char);
    if (index === -1) throw new Error('Invalid Base58 character');
    num = num * base + BigInt(index);
  }
  
  const hex = num.toString(16);
  const padded = hex.length % 2 ? '0' + hex : hex;
  return Buffer.from(padded, 'hex');
}

/**
 * Encode Buffer to Base58 string
 */
function base58Encode(buffer: Buffer): string {
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
export function parsePrivateKey(privateKeyWif: string): Buffer {
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
    
  } catch (error) {
    throw new HiveError(`Invalid private key format: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create transaction hash for signing
 */
function createTransactionHash(transaction: any): Buffer {
  const serialized = JSON.stringify(transaction);
  return createHash('sha256').update(serialized, 'utf8').digest();
}

/**
 * Sign transaction hash using secp256k1
 */
export function signTransaction(transaction: any, privateKey: Buffer): string {
  try {
    const txHash = createTransactionHash(transaction);
    const signature = secp256k1.ecdsaSign(txHash, privateKey);
    
    // Convert to DER format and encode as hex
    const derSignature = secp256k1.signatureExport(signature.signature);
    return Buffer.from(derSignature).toString('hex') + '01'; // Add SIGHASH_ALL flag
    
  } catch (error) {
    throw new HiveError(`Transaction signing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate transaction ID from transaction object
 */
export function generateTransactionId(transaction: any): string {
  try {
    const hash = createTransactionHash(transaction);
    return hash.toString('hex');
  } catch (error) {
    throw new HiveError(`Transaction ID generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create a complete Hive transaction structure
 */
export function createHiveTransaction(operations: any[], options: {
  ref_block_num: number;
  ref_block_prefix: number;
  expiration: string;
}): any {
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
export function signHiveTransaction(transaction: any, privateKey: Buffer): any {
  const signature = signTransaction(transaction, privateKey);
  
  return {
    ...transaction,
    signatures: [signature],
    transaction_id: generateTransactionId(transaction)
  };
}