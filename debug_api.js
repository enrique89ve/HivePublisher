// Debug API calls to identify the exact issue
const { HiveClient } = require('./dist/src/hive-client.js');

async function debugAPI() {
  const client = new HiveClient();
  
  console.log('Testing database_api.find_accounts...');
  try {
    const result = await client.getAccount('mahdiyari');
    console.log('✅ Account API working:', result ? result.name : 'No result');
  } catch (error) {
    console.log('❌ Account API error:', error.message);
  }
  
  console.log('\nTesting database_api.get_dynamic_global_properties...');
  try {
    const result = await client.getDynamicGlobalProperties();
    console.log('✅ Global props working:', result ? 'Yes' : 'No result');
  } catch (error) {
    console.log('❌ Global props error:', error.message);
  }
  
  console.log('\nTesting follow_api.get_follow_count...');
  try {
    const result = await client.getFollowCount('mahdiyari');
    console.log('✅ Follow count working:', result ? 'Yes' : 'No result');
  } catch (error) {
    console.log('❌ Follow count error:', error.message);
  }
}

debugAPI();