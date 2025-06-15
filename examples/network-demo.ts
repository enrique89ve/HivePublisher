/**
 * Network configuration demonstration - Mainnet vs Testnet
 */

import { HiveClient, getAccountInfo, createPost } from '../src/index.js';
import { HiveCredentials, PostMetadata } from '../src/types.js';

async function networkDemo() {
  console.log('🌐 HiveTS - Network Configuration Demo\n');

  // Demo 1: Mainnet Configuration (default)
  console.log('📡 Demo 1: Mainnet Configuration');
  const mainnetClient = new HiveClient({ mainnet: true });
  console.log(`Network: ${mainnetClient.getNetworkName()}`);
  console.log(`Is Mainnet: ${mainnetClient.isMainnet()}`);

  try {
    const account = await getAccountInfo('mahdiyari', mainnetClient);
    if (account) {
      console.log(`✅ Mainnet account found: @${account.name} (${account.total_posts} posts)`);
    }
  } catch (error) {
    console.log(`❌ Mainnet connection failed: ${error}`);
  }

  // Demo 2: Testnet Configuration
  console.log('\n📡 Demo 2: Testnet Configuration');
  const testnetClient = new HiveClient({ mainnet: false });
  console.log(`Network: ${testnetClient.getNetworkName()}`);
  console.log(`Is Mainnet: ${testnetClient.isMainnet()}`);

  try {
    // Try to get account info from testnet
    const testAccount = await testnetClient.getAccount('alice');
    console.log('✅ Testnet connection successful');
  } catch (error) {
    console.log(`⚠️  Testnet response: Connection attempted`);
  }

  // Demo 3: Environment-based Configuration
  console.log('\n🔧 Demo 3: Environment-based Configuration');
  
  const isDevelopment = process.env.NODE_ENV === 'development';
  const envClient = new HiveClient({ 
    mainnet: !isDevelopment // Use testnet in development
  });
  
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`Auto-selected network: ${envClient.getNetworkName()}`);

  // Demo 4: Content Publishing with Network Awareness
  console.log('\n📝 Demo 4: Network-aware Publishing');
  
  const username = process.env.HIVE_USERNAME || 'test-user';
  const postingKey = process.env.HIVE_POSTING_KEY || 'test-key';

  if (username === 'test-user' || postingKey === 'test-key') {
    console.log('⚠️  Demo mode: Set HIVE_USERNAME and HIVE_POSTING_KEY for live testing');
    console.log('\n📋 Network Configuration Usage:');
    console.log('```typescript');
    console.log('// Mainnet (production)');
    console.log('const client = new HiveClient({ mainnet: true });');
    console.log('');
    console.log('// Testnet (development)');
    console.log('const client = new HiveClient({ mainnet: false });');
    console.log('');
    console.log('// Environment-based');
    console.log('const client = new HiveClient({ ');
    console.log('  mainnet: process.env.NODE_ENV === "production"');
    console.log('});');
    console.log('```');
    return;
  }

  console.log('🔑 Live credentials detected');

  const credentials: HiveCredentials = {
    username,
    postingKey
  };

  // Use mainnet for production posts
  const productionClient = new HiveClient({ mainnet: true });
  
  const postData: PostMetadata = {
    title: `Network Test - ${productionClient.getNetworkName()}`,
    body: `This post demonstrates HiveTS network configuration.

**Network Details:**
- Current network: ${productionClient.getNetworkName()}
- Is mainnet: ${productionClient.isMainnet()}
- Timestamp: ${new Date().toISOString()}

The library automatically configures the appropriate API endpoints based on the network setting.`,
    tags: ['hivets', 'network', 'demo']
  };

  try {
    console.log(`🚀 Publishing to ${productionClient.getNetworkName()}...`);
    const result = await createPost(credentials, postData, productionClient);
    
    if (result.success) {
      console.log(`✅ Post published to ${productionClient.getNetworkName()}`);
      console.log(`Transaction: ${result.transaction_id}`);
    } else {
      console.log(`⚠️  Publishing result: ${result.error}`);
    }
  } catch (error) {
    console.log(`❌ Publishing failed: ${error}`);
  }

  console.log('\n🏁 Network demo completed');
  console.log('\n📊 Summary:');
  console.log('• mainnet: true  → Production Hive blockchain');
  console.log('• mainnet: false → Testnet for development');
  console.log('• Automatic API endpoint selection');
  console.log('• Environment-based configuration support');
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  networkDemo().catch(console.error);
}

export { networkDemo };