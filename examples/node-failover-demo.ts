/**
 * Node failover and API configuration demonstration
 */

import { HiveClient, getAccountInfo } from '../src/index.js';

async function nodeFailoverDemo() {
  console.log('🔗 HiveTS - Node Failover Demo\n');

  // Demo 1: Default configuration with api.hive.blog
  console.log('📡 Demo 1: Default Primary Node (api.hive.blog)');
  const defaultClient = new HiveClient();
  console.log(`Primary node: ${defaultClient.getCurrentNode()}`);
  console.log(`Available nodes: ${defaultClient.getConfiguredNodes().length}`);
  
  try {
    const account = await getAccountInfo('mahdiyari', defaultClient);
    if (account) {
      console.log(`✅ Success with primary node: @${account.name}`);
    }
  } catch (error) {
    console.log(`❌ Primary node failed: ${error}`);
  }

  // Demo 2: Custom primary node with fallback
  console.log('\n📡 Demo 2: Custom Primary Node with Fallbacks');
  const customClient = new HiveClient({
    apiNode: 'https://rpc.mahdiyari.info',
    fallbackNodes: [
      'https://api.hive.blog',
      'https://hived.emre.sh',
      'https://api.deathwing.me'
    ]
  });
  
  console.log(`Custom primary: ${customClient.getCurrentNode()}`);
  console.log(`Total nodes configured: ${customClient.getConfiguredNodes().length}`);
  
  try {
    const account = await getAccountInfo('mahdiyari', customClient);
    if (account) {
      console.log(`✅ Success with custom configuration: @${account.name}`);
    }
  } catch (error) {
    console.log(`❌ Custom configuration failed: ${error}`);
  }

  // Demo 3: Simulated failover by using a bad primary node
  console.log('\n📡 Demo 3: Failover Simulation');
  const failoverClient = new HiveClient({
    apiNode: 'https://invalid-node.example.com',
    fallbackNodes: [
      'https://api.hive.blog',
      'https://rpc.mahdiyari.info'
    ],
    timeout: 3000,
    maxRetries: 2
  });
  
  console.log(`Bad primary node: ${failoverClient.getCurrentNode()}`);
  console.log('Testing automatic failover...');
  
  // Set NODE_ENV to development to see failover logs
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'development';
  
  try {
    const account = await getAccountInfo('mahdiyari', failoverClient);
    if (account) {
      console.log(`✅ Failover successful: @${account.name}`);
      console.log(`Active node after failover: ${failoverClient.getCurrentNode()}`);
    }
  } catch (error) {
    console.log(`❌ All nodes failed: ${error}`);
  }
  
  // Restore environment
  process.env.NODE_ENV = originalEnv;

  // Demo 4: High-reliability configuration
  console.log('\n📡 Demo 4: High-Reliability Configuration');
  const reliableClient = new HiveClient({
    apiNode: 'https://api.hive.blog',
    fallbackNodes: [
      'https://rpc.mahdiyari.info',
      'https://hived.emre.sh',
      'https://api.deathwing.me',
      'https://hive-api.arcange.eu',
      'https://api.openhive.network'
    ],
    timeout: 8000,
    maxRetries: 3
  });
  
  console.log(`Primary: ${reliableClient.getCurrentNode()}`);
  console.log(`Total fallback nodes: ${reliableClient.getConfiguredNodes().length - 1}`);
  console.log('Configuration optimized for maximum reliability');
  
  try {
    const account = await getAccountInfo('mahdiyari', reliableClient);
    if (account) {
      console.log(`✅ High-reliability config successful: @${account.name}`);
    }
  } catch (error) {
    console.log(`❌ High-reliability config failed: ${error}`);
  }

  console.log('\n🏁 Node failover demo completed');
  console.log('\n📊 Configuration Summary:');
  console.log('• Default: api.hive.blog with 5 fallback nodes');
  console.log('• Custom: Set apiNode + fallbackNodes array');
  console.log('• Automatic failover with exponential backoff');
  console.log('• Configurable timeout and retry limits');
  console.log('• Network-aware (mainnet/testnet) endpoints');

  console.log('\n🔧 Usage Examples:');
  console.log('```typescript');
  console.log('// Default (recommended)');
  console.log('const client = new HiveClient();');
  console.log('');
  console.log('// Custom primary with fallbacks');
  console.log('const client = new HiveClient({');
  console.log('  apiNode: "https://your-node.com",');
  console.log('  fallbackNodes: ["https://api.hive.blog"]');
  console.log('});');
  console.log('');
  console.log('// High-reliability setup');
  console.log('const client = new HiveClient({');
  console.log('  timeout: 10000,');
  console.log('  maxRetries: 5');
  console.log('});');
  console.log('```');
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  nodeFailoverDemo().catch(console.error);
}

export { nodeFailoverDemo };