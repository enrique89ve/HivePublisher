/**
 * Hive API Server Runner
 * Simple script to start the Hive API server
 */
import { HiveApiServer } from '../src/hive-api-server.js';
async function startServer() {
    console.log('🤖 Starting Hive API Server...');
    const port = parseInt(process.env.PORT || '3000');
    const server = new HiveApiServer(port);
    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down server gracefully...');
        process.exit(0);
    });
    process.on('SIGTERM', () => {
        console.log('\n🛑 Shutting down server gracefully...');
        process.exit(0);
    });
    // Start the server
    server.start();
}
// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    startServer().catch(error => {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    });
}
export { startServer };
//# sourceMappingURL=api-server-runner.js.map