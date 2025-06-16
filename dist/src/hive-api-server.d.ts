/**
 * Hive API Server - Complete REST API for Hive blockchain operations
 * Handles all posting, editing, and queue management server-side
 */
declare class HiveApiServer {
    private app;
    private port;
    private client;
    private apiKeys;
    private jobStatuses;
    private jobQueue;
    private isProcessingQueue;
    private lastPostTimes;
    private readonly HIVE_POST_INTERVAL;
    constructor(port?: number);
    private setupMiddleware;
    private setupRoutes;
    private handleHealth;
    private handleRegisterApiKey;
    private handleRevokeApiKey;
    private handleCreatePost;
    private handleEditPost;
    private handleGetJobStatus;
    private handleGetQueue;
    private handleCancelJob;
    private handleGetAccount;
    private startQueueProcessor;
    private processJob;
    private processPostJob;
    private processEditJob;
    start(): void;
}
export { HiveApiServer };
//# sourceMappingURL=hive-api-server.d.ts.map