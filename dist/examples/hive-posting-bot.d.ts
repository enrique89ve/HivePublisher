/**
 * Hive Posting Bot Example
 *
 * A complete example bot that automatically publishes posts to the Hive blockchain
 * using the HiveTS library. Supports scheduled posting, content templates, and
 * automatic tag management.
 */
import { HiveClient, HiveCredentials } from '../src/index.js';
interface BotConfig {
    credentials: HiveCredentials;
    defaultTags: string[];
    postingInterval: number;
    autoVoteOwnPosts: boolean;
    voteWeight: number;
    client?: HiveClient;
}
interface PostTemplate {
    title: string;
    body: string;
    tags?: string[];
    description?: string;
    image?: string;
}
export declare class HivePostingBot {
    private config;
    private client;
    private isRunning;
    private postQueue;
    constructor(config: BotConfig);
    /**
     * Start the bot - begins processing the post queue
     */
    start(): Promise<void>;
    /**
     * Stop the bot
     */
    stop(): void;
    /**
     * Add a post to the queue
     */
    addPost(post: PostTemplate): void;
    /**
     * Add multiple posts from a JSON file
     */
    loadPostsFromFile(filePath: string): void;
    /**
     * Create a post immediately (bypass queue)
     */
    publishPost(post: PostTemplate): Promise<boolean>;
    /**
     * Auto-vote own post
     */
    private autoVotePost;
    /**
     * Process the post queue
     */
    private processQueue;
    /**
     * Get queue status
     */
    getStatus(): {
        isRunning: boolean;
        queueLength: number;
        account: string;
    };
    /**
     * Clear the post queue
     */
    clearQueue(): void;
    /**
     * Sleep utility
     */
    private sleep;
}
declare function runBotDemo(): Promise<void>;
export { runBotDemo };
//# sourceMappingURL=hive-posting-bot.d.ts.map