/**
 * WAX-inspired improvements demonstration
 * Shows enterprise features while maintaining simplicity
 */
import { HiveClient, getAccountInfo } from '../src/index.js';
async function waxImprovementsDemo() {
    console.log('🔧 WAX-Inspired Improvements Demo\n');
    // Demo 1: Request/Response Interceptors (WAX Pattern)
    console.log('📡 Demo 1: Request/Response Interceptors');
    const requestInterceptor = (config) => {
        console.log(`→ Outgoing request to: ${new URL(config.url).hostname}`);
        config.headers['X-Client-Version'] = 'HiveTS-Enhanced';
        return config;
    };
    const responseInterceptor = (response) => {
        console.log(`← Response received with ${Object.keys(response).length} fields`);
        return response;
    };
    const interceptorClient = new HiveClient({
        mainnet: true,
        requestInterceptor,
        responseInterceptor
    });
    try {
        const account = await getAccountInfo('mahdiyari', interceptorClient);
        if (account) {
            console.log(`✅ Intercepted request successful: @${account.name}`);
        }
    }
    catch (error) {
        console.log(`❌ Intercepted request failed: ${error}`);
    }
    // Demo 2: Extension System (WAX Pattern)
    console.log('\n🔌 Demo 2: Extension System');
    const baseClient = new HiveClient({ mainnet: true });
    // Custom analytics extension
    const analyticsExtension = {
        requestCount: 0,
        lastRequestTime: 0,
        trackRequest() {
            this.requestCount++;
            this.lastRequestTime = Date.now();
        },
        getAnalytics() {
            return {
                totalRequests: this.requestCount,
                lastRequest: new Date(this.lastRequestTime).toISOString()
            };
        }
    };
    const extendedClient = baseClient.extend(analyticsExtension);
    // Test the extension
    extendedClient.trackRequest();
    extendedClient.trackRequest();
    console.log('Analytics after extension:', extendedClient.getAnalytics());
    // Demo 3: TAPOS Caching (WAX Pattern)
    console.log('\n⏱️  Demo 3: TAPOS Caching System');
    const cachingClient = new HiveClient({ mainnet: true });
    console.log('First TAPOS request (cache miss):');
    const startTime1 = Date.now();
    const tapos1 = await cachingClient.getTaposCache();
    const duration1 = Date.now() - startTime1;
    console.log(`Block: ${tapos1.head_block_id.slice(0, 8)}... (${duration1}ms)`);
    console.log('Second TAPOS request (cache hit):');
    const startTime2 = Date.now();
    const tapos2 = await cachingClient.getTaposCache();
    const duration2 = Date.now() - startTime2;
    console.log(`Block: ${tapos2.head_block_id.slice(0, 8)}... (${duration2}ms)`);
    console.log(`Cache efficiency: ${Math.round((duration1 / duration2) * 100) / 100}x faster`);
    // Demo 4: Advanced Node Metrics (WAX Pattern)
    console.log('\n📊 Demo 4: Advanced Node Performance Metrics');
    const metricsClient = new HiveClient({ mainnet: true });
    console.log('Analyzing node performance...');
    const metrics = await metricsClient.getNodeMetrics();
    const sortedNodes = Object.entries(metrics)
        .filter(([_, metric]) => metric.healthy)
        .sort((a, b) => a[1].latency - b[1].latency);
    console.log('\nTop performing nodes:');
    sortedNodes.slice(0, 3).forEach(([node, metric], index) => {
        const hostname = new URL(node).hostname;
        console.log(`${index + 1}. ${hostname} - ${metric.latency}ms (Block: ${metric.blockHeight})`);
    });
    // Demo 5: Proxy Configuration (WAX Pattern)
    console.log('\n🔗 Demo 5: Proxy Configuration');
    const loggingRequestInterceptor = (config) => {
        console.log(`[PROXY] Request: ${config.method} ${config.url}`);
        return config;
    };
    const loggingResponseInterceptor = (response) => {
        const size = JSON.stringify(response).length;
        console.log(`[PROXY] Response: ${size} bytes`);
        return response;
    };
    const proxyClient = baseClient.withProxy(loggingRequestInterceptor, loggingResponseInterceptor);
    try {
        const globalProps = await proxyClient.getDynamicGlobalProperties();
        console.log(`✅ Proxy successful: Block ${globalProps.head_block_number}`);
    }
    catch (error) {
        console.log(`❌ Proxy failed: ${error}`);
    }
    // Demo 6: Health Monitoring Comparison
    console.log('\n🏥 Demo 6: Health Monitoring Systems');
    const monitoringClient = new HiveClient({ mainnet: true });
    console.log('Basic health check:');
    const healthyNodes = await monitoringClient.getHealthyNodes();
    console.log(`Healthy nodes: ${healthyNodes.length}/${monitoringClient.getConfiguredNodes().length}`);
    console.log('\nAdvanced metrics:');
    const advancedMetrics = await monitoringClient.getNodeMetrics();
    const avgLatency = Object.values(advancedMetrics)
        .filter(m => m.healthy)
        .reduce((sum, m) => sum + m.latency, 0) / healthyNodes.length;
    console.log(`Average latency: ${Math.round(avgLatency)}ms`);
    console.log(`Network sync status: ${Object.values(advancedMetrics)
        .filter(m => m.healthy)
        .every(m => Math.abs(m.blockHeight - Math.max(...Object.values(advancedMetrics).map(x => x.blockHeight))) <= 1)
        ? 'Synchronized' : 'Drift detected'}`);
    // Demo 7: Configuration Flexibility
    console.log('\n⚙️  Demo 7: Configuration Flexibility');
    console.log('Enterprise configuration:');
    const enterpriseClient = new HiveClient({
        mainnet: true,
        timeout: 15000,
        maxRetries: 5,
        enableRestApi: true,
        requestInterceptor: (config) => {
            config.headers['X-Enterprise-Mode'] = 'true';
            return config;
        }
    });
    console.log(`Timeout: ${enterpriseClient['timeout']}ms`);
    console.log(`Max retries: ${enterpriseClient['maxRetries']}`);
    console.log(`Total nodes: ${enterpriseClient.getConfiguredNodes().length}`);
    console.log('\nDevelopment configuration:');
    const devClient = new HiveClient({
        mainnet: false,
        timeout: 5000,
        maxRetries: 2
    });
    console.log(`Network: ${devClient.getNetworkName()}`);
    console.log(`Optimized for: Development speed`);
    console.log('\n🏁 WAX-Inspired Improvements Summary:');
    console.log('✅ Request/Response interceptors for middleware');
    console.log('✅ Extension system for custom functionality');
    console.log('✅ TAPOS caching with intelligent refresh');
    console.log('✅ Advanced node performance metrics');
    console.log('✅ Proxy configuration support');
    console.log('✅ Enhanced health monitoring');
    console.log('✅ Flexible configuration patterns');
    console.log('\n📈 Benefits vs Pure WAX:');
    console.log('• Simpler setup (npm install vs WASM compilation)');
    console.log('• Better node reliability (8 nodes vs single endpoint)');
    console.log('• TypeScript-first (vs JavaScript bindings)');
    console.log('• Maintained backward compatibility');
    console.log('• Production-ready with zero configuration');
}
// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    waxImprovementsDemo().catch(console.error);
}
export { waxImprovementsDemo };
//# sourceMappingURL=wax-improvements-demo.js.map