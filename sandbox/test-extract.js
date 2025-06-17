#!/usr/bin/env node
// @ts-check

// Quick sandbox script to test data extraction operations
// Usage: npm run build && node sandbox/test-extract.js

// Import Hive Publisher functions with type support from local dist
const {
  getAccountInfo,
  getPostContent,
  getComments,
} = /** @type {typeof import('../dist/index.js')} */ require('../dist/index.js');

async function runTests() {
  try {
    console.log('Fetching account info for @ned...');
    const account = await getAccountInfo('enrique89');
    console.log('Account Info:', account);
    console.log('Voting mana %:', account.voting_mana_pct);

    console.log('\nFetching post content for a known permlink...');
    const permlink = 'testing-hivets-lite-1750108169';
    const post = await getPostContent('enrique89.test', permlink);
    console.log('Post Content:', post);

    console.log('\nFetching comments for the same permlink...');
    const comments = await getComments('enrique89.test', permlink);
    console.log('Comments:', comments);
  } catch (error) {
    console.error('Error during sandbox tests:', error);
    process.exit(1);
  }
}

runTests();
