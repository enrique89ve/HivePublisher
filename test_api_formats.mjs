// Test different API formats to find working combination
async function testFormats() {
  const endpoints = [
    'https://api.hive.blog',
    'https://api.deathwing.me',
    'https://rpc.mahdiyari.info'
  ];
  
  const formats = [
    {
      name: 'condenser_api.get_accounts',
      payload: { method: 'condenser_api.get_accounts', params: [['mahdiyari']] }
    },
    {
      name: 'database_api.find_accounts',  
      payload: { method: 'database_api.find_accounts', params: { accounts: ['mahdiyari'] } }
    }
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\n=== Testing ${endpoint} ===`);
    
    for (const format of formats) {
      try {
        const payload = {
          jsonrpc: '2.0',
          id: 1,
          ...format.payload
        };
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        
        if (response.ok && !data.error) {
          console.log(`✅ ${format.name}: SUCCESS`);
          if (data.result) {
            const account = data.result[0] || data.result.accounts?.[0];
            if (account) console.log(`   Account: ${account.name}`);
          }
        } else {
          console.log(`❌ ${format.name}: ${data.error?.message || 'Failed'}`);
        }
      } catch (error) {
        console.log(`❌ ${format.name}: ${error.message}`);
      }
    }
  }
}

testFormats();