"use strict";
/**
 * Cryptographic utilities for Hive blockchain operations
 * Using hive-tx library for reliable transaction signing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePrivateKey = parsePrivateKey;
const hive_tx_1 = require("hive-tx");
const types_js_1 = require("./types.js");
/**
 * Parse WIF (Wallet Import Format) private key using hive-tx
 *
 * @param privateKeyWif - WIF-formatted private key string
 * @returns PrivateKey instance for transaction signing
 * @throws HiveError if key format is invalid
 */
function parsePrivateKey(privateKeyWif) {
    try {
        return hive_tx_1.PrivateKey.from(privateKeyWif);
    }
    catch (error) {
        throw new types_js_1.HiveError(`Invalid private key format: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
//# sourceMappingURL=crypto.js.map