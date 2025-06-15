/**
 * TypeScript type definitions for Hive blockchain operations
 */
export class HiveError extends Error {
    constructor(message, code, data) {
        super(message);
        this.code = code;
        this.data = data;
        this.name = 'HiveError';
    }
}
//# sourceMappingURL=types.js.map