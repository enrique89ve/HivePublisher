"use strict";
/**
 * Cryptographic utilities for Hive blockchain
 * Extracted minimal functions from hivedb
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePrivateKey = parsePrivateKey;
exports.signTransaction = signTransaction;
exports.generateTransactionId = generateTransactionId;
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
 * Simple ECDSA signing (placeholder implementation)
 * Note: This is a simplified version. In production, use a proper crypto library like secp256k1
 */
async function signTransaction(transaction, privateKey) {
    // This is a placeholder implementation
    // In a real implementation, you would:
    // 1. Serialize the transaction properly
    // 2. Create the signature hash
    // 3. Sign with secp256k1
    // 4. Return the signature in the correct format
    const transactionString = JSON.stringify(transaction);
    const messageBytes = new TextEncoder().encode(transactionString);
    // Import the private key for signing
    const keyMaterial = await crypto.subtle.importKey('raw', privateKey, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    // Sign the message
    const signature = await crypto.subtle.sign('HMAC', keyMaterial, messageBytes);
    // Convert to hex and return (this is simplified)
    return bytesToHex(new Uint8Array(signature));
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