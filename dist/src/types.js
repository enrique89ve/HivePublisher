"use strict";
/**
 * TypeScript type definitions for Hive blockchain operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HiveError = void 0;
class HiveError extends Error {
    constructor(message, code, data) {
        super(message);
        this.code = code;
        this.data = data;
        this.name = 'HiveError';
    }
}
exports.HiveError = HiveError;
//# sourceMappingURL=types.js.map