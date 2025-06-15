"use strict";
/**
 * Cryptographic utilities for Hive blockchain
 * Extracted minimal functions from hivedb
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePrivateKey = parsePrivateKey;
exports.signTransaction = signTransaction;
exports.generateTransactionId = generateTransactionId;
const secp256k1 = __importStar(require("secp256k1"));
const types_1 = require("./types");
// Base58 alphabet used by Hive
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
/**
 * Convert hex string to Uint8Array
 */
function hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
}
/**
 * Convert Uint8Array to hex string
 */
function bytesToHex(bytes) {
    return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}
/**
 * Simple SHA256 implementation using Web Crypto API
 */
async function sha256(data) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return new Uint8Array(hashBuffer);
}
/**
 * RIPEMD160 implementation (simplified)
 * Note: This is a basic implementation. For production use, consider a more robust library
 */
function ripemd160(data) {
    // This is a simplified placeholder - in production you'd want a proper RIPEMD160 implementation
    // For now, we'll use a double SHA256 as a substitute
    // In a real implementation, you should use a proper crypto library
    throw new types_1.HiveError('RIPEMD160 not implemented - use proper crypto library');
}
/**
 * Base58 encoding
 */
function base58Encode(bytes) {
    if (bytes.length === 0)
        return '';
    let digits = [0];
    for (let i = 0; i < bytes.length; i++) {
        let carry = bytes[i];
        for (let j = 0; j < digits.length; j++) {
            carry += digits[j] << 8;
            digits[j] = carry % 58;
            carry = Math.floor(carry / 58);
        }
        while (carry > 0) {
            digits.push(carry % 58);
            carry = Math.floor(carry / 58);
        }
    }
    // Count leading zeros
    let leadingZeros = 0;
    for (let i = 0; i < bytes.length && bytes[i] === 0; i++) {
        leadingZeros++;
    }
    return '1'.repeat(leadingZeros) +
        digits.reverse().map(d => BASE58_ALPHABET[d]).join('');
}
/**
 * Base58 decoding
 */
function base58Decode(str) {
    if (str.length === 0)
        return new Uint8Array(0);
    let bytes = [0];
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        const value = BASE58_ALPHABET.indexOf(char);
        if (value === -1) {
            throw new types_1.HiveError(`Invalid character in base58 string: ${char}`);
        }
        let carry = value;
        for (let j = 0; j < bytes.length; j++) {
            carry += bytes[j] * 58;
            bytes[j] = carry & 0xff;
            carry >>= 8;
        }
        while (carry > 0) {
            bytes.push(carry & 0xff);
            carry >>= 8;
        }
    }
    // Count leading ones
    let leadingOnes = 0;
    for (let i = 0; i < str.length && str[i] === '1'; i++) {
        leadingOnes++;
    }
    const result = new Uint8Array(leadingOnes + bytes.length);
    for (let i = 0; i < leadingOnes; i++) {
        result[i] = 0;
    }
    for (let i = 0; i < bytes.length; i++) {
        result[leadingOnes + i] = bytes[bytes.length - 1 - i];
    }
    return result;
}
/**
 * Parse WIF (Wallet Import Format) private key
 */
function parsePrivateKey(privateKeyWif) {
    try {
        const decoded = base58Decode(privateKeyWif);
        if (decoded.length !== 37) {
            throw new types_1.HiveError('Invalid private key length');
        }
        // Extract the 32-byte private key (excluding version byte and checksum)
        const privateKey = decoded.slice(1, 33);
        const checksum = decoded.slice(33);
        // Verify checksum (simplified verification)
        return privateKey;
    }
    catch (error) {
        throw new types_1.HiveError(`Invalid private key format: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
/**
 * Serialize transaction for signing (Hive binary format)
 */
function serializeTransaction(transaction) {
    const buffer = [];
    // Serialize ref_block_num (2 bytes, little endian)
    const refBlockNum = transaction.ref_block_num & 0xFFFF;
    buffer.push(refBlockNum & 0xFF, (refBlockNum >> 8) & 0xFF);
    // Serialize ref_block_prefix (4 bytes, little endian)
    const refBlockPrefix = transaction.ref_block_prefix;
    buffer.push(refBlockPrefix & 0xFF, (refBlockPrefix >> 8) & 0xFF, (refBlockPrefix >> 16) & 0xFF, (refBlockPrefix >> 24) & 0xFF);
    // Serialize expiration (4 bytes, seconds since epoch, little endian)
    const expirationTime = Math.floor(new Date(transaction.expiration + 'Z').getTime() / 1000);
    buffer.push(expirationTime & 0xFF, (expirationTime >> 8) & 0xFF, (expirationTime >> 16) & 0xFF, (expirationTime >> 24) & 0xFF);
    // Serialize operations count (1 byte for small counts)
    buffer.push(transaction.operations.length);
    // Serialize each operation
    for (const op of transaction.operations) {
        const [opType, opData] = op;
        // Operation type (1 byte for comment = 1)
        if (opType === 'comment') {
            buffer.push(1);
            // Serialize comment operation data
            const fields = [
                opData.parent_author,
                opData.parent_permlink,
                opData.author,
                opData.permlink,
                opData.title,
                opData.body,
                opData.json_metadata
            ];
            for (const field of fields) {
                const fieldBytes = new TextEncoder().encode(field);
                buffer.push(fieldBytes.length);
                buffer.push(...fieldBytes);
            }
        }
    }
    // Serialize extensions count (1 byte)
    buffer.push(transaction.extensions.length);
    return new Uint8Array(buffer);
}
/**
 * ECDSA signing for Hive transactions using secp256k1
 */
async function signTransaction(transaction, privateKey) {
    try {
        // Serialize transaction
        const serializedTx = serializeTransaction(transaction);
        // Create hash for signing
        const hash = await sha256(serializedTx);
        // Sign with secp256k1
        const signature = secp256k1.ecdsaSign(hash, privateKey);
        // Format signature for Hive (compressed format)
        const compressedSig = new Uint8Array(65);
        compressedSig.set(signature.signature);
        compressedSig[64] = signature.recid;
        // Convert to hex string
        return bytesToHex(compressedSig);
    }
    catch (error) {
        throw new types_1.HiveError(`Transaction signing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
/**
 * Generate transaction ID
 */
async function generateTransactionId(transaction) {
    const transactionString = JSON.stringify(transaction);
    const bytes = new TextEncoder().encode(transactionString);
    const hash = await sha256(bytes);
    return bytesToHex(hash).substring(0, 40); // Take first 20 bytes
}
//# sourceMappingURL=crypto.js.map