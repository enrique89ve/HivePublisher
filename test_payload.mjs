// Test exact payload format
async function testPayload() {
  const payload1 = {
    jsonrpc: '2.0',
    method: 'database_api.find_accounts',
    params: { accounts: ['mahdiyari'] },
    id: 1
  };
  
  console.log('Testing payload 1:', JSON.stringify(payload1, null, 2));
  
  try {
    const response = await fetch('https://api.hive.blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload1)
    });
    
    const data = await response.json();
    console.log('Response 1:', response.status, response.ok);
    if (data.error) {
      console.log('Error 1:', data.error.message);
    } else {
      console.log('Success 1: Account found');
    }
  } catch (error) {
    console.log('Network error 1:', error.message);
  }
}

testPayload();