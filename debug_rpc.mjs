// Debug exact RPC payloads to identify the serialization issue
import { HiveClient } from './dist/src/hive-client.js';

async function debugRpcIssue() {
  console.log('=== Debugging RPC Serialization Issue ===\n');
  
  // Test 1: Direct working call
  console.log('1. Working direct call:');
  const workingPayload = {
    jsonrpc: '2.0',
    method: 'condenser_api.get_accounts',
    params: [['mahdiyari']],
    id: 1
  };
  
  console.log('Payload:', JSON.stringify(workingPayload, null, 2));
  
  try {
    const response = await fetch('https://rpc.mahdiyari.info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workingPayload)
    });
    const data = await response.json();
    console.log('Result: SUCCESS - Account found\n');
  } catch (error) {
    console.log('Result: FAILED -', error.message, '\n');
  }
  
  // Test 2: Our client call
  console.log('2. Our client call:');
  const client = new HiveClient({ apiNode: 'https://rpc.mahdiyari.info' });
  
  // Add debugging to see what gets sent
  const originalCall = client.call.bind(client);
  client.call = function(method, params) {
    console.log('Method:', method);
    console.log('Params:', JSON.stringify(params, null, 2));
    return originalCall(method, params);
  };
  
  try {
    const result = await client.getAccount('mahdiyari');
    console.log('Result: SUCCESS - Account found\n');
  } catch (error) {
    console.log('Result: FAILED -', error.message, '\n');
  }
}

debugRpcIssue();