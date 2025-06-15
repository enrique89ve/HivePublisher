/**
 * Cryptographic utilities for Hive blockchain
 * Extracted minimal functions from hivedb
 */
/**
 * Parse WIF (Wallet Import Format) private key
 */
export declare function parsePrivateKey(privateKeyWif: string): Uint8Array;
/**
 * Simple ECDSA signing (placeholder implementation)
 * Note: This is a simplified version. In production, use a proper crypto library like secp256k1
 */
export declare function signTransaction(transaction: any, privateKey: Uint8Array): Promise<string>;
/**
 * Generate transaction ID
 */
export declare function generateTransactionId(transaction: any): Promise<string>;
//# sourceMappingURL=crypto.d.ts.map