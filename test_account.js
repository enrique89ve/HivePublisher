// Simple test of account API call
const fetch = require('node:fetch');

async function testAccountAPI() {
  try {
    const payload = {
      jsonrpc: '2.0',
      method: 'condenser_api.get_accounts',
      params: [['mahdiyari']],
      id: 1
    };

    const response = await fetch('https://api.deathwing.me', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    const data = await response.json();
    
    if (data.result && data.result[0]) {
      const account = data.result[0];
      console.log('✅ Account found:', account.name);
      console.log('📊 Post count:', account.post_count);
      console.log('💰 HIVE balance:', account.balance);
      console.log('🔑 Reputation:', account.reputation);
    } else {
      console.log('❌ No account data found');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAccountAPI();
