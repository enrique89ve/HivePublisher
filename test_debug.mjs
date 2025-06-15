// Comprehensive debugging of our library vs working implementation
import { HiveClient } from './dist/src/hive-client.js';

async function compareImplementations() {
  console.log('=== Testing Direct Fetch (Working) ===');
  try {
    const payload = {
      jsonrpc: '2.0',
      method: 'database_api.find_accounts',
      params: { accounts: ['mahdiyari'] },
      id: 1
    };
    
    const response = await fetch('https://api.hive.blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    console.log('✅ Direct fetch success:', data.result.accounts[0].name);
  } catch (error) {
    console.log('❌ Direct fetch error:', error.message);
  }
  
  console.log('\n=== Testing Our HiveClient ===');
  try {
    const client = new HiveClient();
    console.log('Client created, testing call method...');
    
    // Test with exact same parameters
    const result = await client.call('database_api.find_accounts', { accounts: ['mahdiyari'] });
    console.log('✅ HiveClient success:', result.accounts[0].name);
  } catch (error) {
    console.log('❌ HiveClient error:', error.message);
    console.log('Error details:', error);
  }
}

compareImplementations();