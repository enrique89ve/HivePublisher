// Debug API calls using ES modules
import { HiveClient } from './dist/src/hive-client.js';

async function debugAPI() {
  const client = new HiveClient();
  
  console.log('Testing raw RPC call...');
  try {
    const result = await client.call('database_api.find_accounts', { accounts: ['mahdiyari'] });
    console.log('✅ Raw RPC working:', result ? 'Yes' : 'No result');
    console.log('Result structure:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('❌ Raw RPC error:', error.message);
  }
}

debugAPI();