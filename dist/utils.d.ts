/**
 * Generate a URL-friendly permlink from a title following Ecency's approach
 */
export declare function generatePermlink(title: string, random?: boolean): string;
/**
 * Validate Hive username format
 */
export declare function validateUsername(username: string): boolean;
/**
 * Validate post tags
 */
export declare function validateTags(tags: string[]): boolean;
/**
 * Format date for Hive blockchain
 */
export declare function formatHiveDate(date: Date): string;
/**
 * Parse Hive date string
 */
export declare function parseHiveDate(dateString: string): Date;
/**
 * Sanitize post body content
 */
export declare function sanitizeBody(body: string): string;
/**
 * Calculate approximate reading time
 */
export declare function calculateReadingTime(text: string): number;
/**
 * Extract excerpt from post body
 */
export declare function extractExcerpt(body: string, maxLength?: number): string;
//# sourceMappingURL=utils.d.ts.map