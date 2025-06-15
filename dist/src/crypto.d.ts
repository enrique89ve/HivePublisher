/**
 * Lightweight cryptographic utilities for Hive blockchain operations
 * Custom implementation using only secp256k1 - eliminates hive-tx dependency
 */
/**
 * Parse WIF (Wallet Import Format) private key
 * Custom implementation without hive-tx dependency
 */
export declare function parsePrivateKey(privateKeyWif: string): Buffer;
/**
 * Sign transaction hash using secp256k1 with Hive format
 */
export declare function signTransaction(transaction: any, privateKey: Buffer): string;
/**
 * Generate transaction ID from transaction object
 */
export declare function generateTransactionId(transaction: any): string;
/**
 * Create a complete Hive transaction structure
 */
export declare function createHiveTransaction(operations: any[], options: {
    ref_block_num: number;
    ref_block_prefix: number;
    expiration: string;
}): any;
/**
 * Sign and finalize Hive transaction
 */
export declare function signHiveTransaction(transaction: any, privateKey: Buffer): any;
//# sourceMappingURL=crypto.d.ts.map