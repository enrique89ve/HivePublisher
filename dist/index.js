"use strict";
/**
 * HiveTS - Lightweight TypeScript library for Hive blockchain operations
 *
 * @fileoverview Main entry point providing core functionality for Hive blockchain interactions
 * @version 1.0.0
 * @author HiveTS Contributors
 *
 * @example
 * ```typescript
 * import { HiveClient, createPost, upvote, getAccountInfo } from 'hivets';
 *
 * // Get account information
 * const account = await getAccountInfo('username');
 *
 * // Create a post
 * const result = await createPost(credentials, {
 *   title: 'Hello Hive',
 *   body: 'My first post using HiveTS',
 *   tags: ['introduction', 'hivets']
 * });
 * ```
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComments = exports.getPostContent = exports.getAccountInfo = exports.upvote = exports.editPost = exports.createPost = exports.HiveClient = void 0;
// Core client for API communication
var hive_client_js_1 = require("./hive-client.js");
Object.defineProperty(exports, "HiveClient", { enumerable: true, get: function () { return hive_client_js_1.HiveClient; } });
// Type definitions for TypeScript development
__exportStar(require("./types.js"), exports);
// Primary operations for content management and interaction
var operations_js_1 = require("./operations.js");
Object.defineProperty(exports, "createPost", { enumerable: true, get: function () { return operations_js_1.createPost; } });
Object.defineProperty(exports, "editPost", { enumerable: true, get: function () { return operations_js_1.editPost; } });
Object.defineProperty(exports, "upvote", { enumerable: true, get: function () { return operations_js_1.upvote; } });
// Account information retrieval
var accounts_js_1 = require("./accounts.js");
Object.defineProperty(exports, "getAccountInfo", { enumerable: true, get: function () { return accounts_js_1.getAccountInfo; } });
// Content reading operations
var content_js_1 = require("./content.js");
Object.defineProperty(exports, "getPostContent", { enumerable: true, get: function () { return content_js_1.getPostContent; } });
Object.defineProperty(exports, "getComments", { enumerable: true, get: function () { return content_js_1.getComments; } });
//# sourceMappingURL=index.js.map