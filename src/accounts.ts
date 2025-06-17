/**
 * Hive blockchain account operations
 * Based on HAF SQL implementation for comprehensive account data
 */

import { HiveClient } from './hive-client.js';
import { createConfigFromEnv } from './config.js';
import { AccountInfo, HiveError } from './types.js';
import { validateUsername } from './utils.js';

/**
 * Get complete account information from Hive blockchain
 * Optimized with WAX-inspired best practices for maximum performance
 *
 * @param username - Hive username to retrieve information for
 * @param client - Optional HiveClient instance for custom configuration
 * @returns Promise resolving to AccountInfo object or null if account not found
 *
 * @example
 * ```typescript
 * // Single account (fastest - uses individual client per call)
 * const account = await getAccountInfo('alice');
 *
 * // Multiple accounts with shared client (for sequential calls)
 * const client = new HiveClient();
 * const alice = await getAccountInfo('alice', client);
 * const bob = await getAccountInfo('bob', client);
 * await client.shutdown();
 *
 * // Multiple accounts in parallel (fastest for batch)
 * const accounts = await Promise.all([
 *   getAccountInfo('alice'),
 *   getAccountInfo('bob'),
 *   getAccountInfo('charlie')
 * ]);
 * ```
 */
export async function getAccountInfo(
  username: string,
  client?: HiveClient
): Promise<AccountInfo | null> {
  // Validate username format
  if (!validateUsername(username)) {
    throw new HiveError('Invalid username format');
  }

  // Use provided client or create a new one with environment configuration
  const envConfig = createConfigFromEnv();
  const hiveClient = client || new HiveClient(envConfig);
  const shouldCleanup = !client; // Only cleanup if we created the client

  try {
    // WAX-inspired optimization: Parallel API calls with intelligent fallbacks
    // Each call has specific error handling to maximize data recovery
    const results = await Promise.allSettled([
      hiveClient.call('condenser_api.get_accounts', [[username]]),
      hiveClient.call('condenser_api.get_follow_count', [username]),
      hiveClient.call('condenser_api.get_dynamic_global_properties', []),
      hiveClient.call('follow_api.get_account_reputations', {
        account_lower_bound: username,
        limit: 1,
      }),
      hiveClient.call('condenser_api.get_reward_fund', ['post']), // For estimating vote value
    ]);
    const [accountResult, followResult, globalResult, reputationResult, rewardFundResult] = results;

    // Critical path: Check if account exists
    if (accountResult.status === 'rejected' || !accountResult.value?.[0]) {
      return null; // Account not found or network error
    }

    const account = accountResult.value[0];

    // Extract data with robust fallbacks (WAX pattern)
    const followCount =
      followResult.status === 'fulfilled' && followResult.value
        ? followResult.value
        : { follower_count: 0, following_count: 0 };

    // Extract global properties with fallback
    const globalProperties = globalResult.status === 'fulfilled' ? globalResult.value : null;

    // Calculate reputation with proper fallback
    let reputation = 25.0;
    if (
      reputationResult.status === 'fulfilled' &&
      reputationResult.value?.reputations?.[0]?.name === username
    ) {
      const rawRep = Number(reputationResult.value.reputations[0].reputation);
      reputation = parseFloat(calculateHiveReputation(rawRep));
    }

    // Compute estimated vote value (HIVE) based on reward fund
    let voteValue = 0;
    if (rewardFundResult.status === 'fulfilled' && rewardFundResult.value) {
      const fund = rewardFundResult.value;
      const rewardBalance = parseFloat((fund.reward_balance || '0').split(' ')[0]);
      const recentClaims = parseFloat(fund.recent_claims || '0');
      // Use manabar.current_mana (raw rshares) for full 100% vote
      const rshares = account.voting_manabar?.current_mana || 0;
      voteValue = recentClaims > 0 ? (rewardBalance * rshares) / recentClaims : 0;
    }

    // Build optimized AccountInfo object
    const accountInfo: AccountInfo = {
      id: account.id || 0,
      name: account.name || username,
      created: account.created || '',
      json_metadata: account.json_metadata || '{}',
      last_vote_time: account.last_vote_time || '',
      reputation,
      balance: account.balance || '0.000 HIVE',
      hbd_balance: account.hbd_balance || '0.000 HBD',
      vesting_shares: account.vesting_shares || '0.000000 VESTS',
      delegated_vesting_shares: account.delegated_vesting_shares || '0.000000 VESTS',
      received_vesting_shares: account.received_vesting_shares || '0.000000 VESTS',
      voting_power: account.voting_power || 10000,
      post_count: account.post_count || 0,
      can_vote: account.can_vote !== false,
      voting_manabar: account.voting_manabar || { current_mana: 0, last_update_time: 0 },
      voting_mana_pct: parseFloat(((account.voting_power || 0) / 100).toFixed(2)),
      vote_value: parseFloat(voteValue.toFixed(3)),
      follow_count: followCount.follower_count || 0,
      following_count: followCount.following_count || 0,
      hive_power: parseFloat(
        convertVestsToHp(account.vesting_shares || '0.000000 VESTS', globalProperties)
      ),
    };

    return accountInfo;
  } catch (error: any) {
    if (shouldCleanup) {
      await hiveClient.shutdown();
    }
    throw new HiveError(`Failed to fetch account info: ${error.message}`);
  }
}

/**
 * Calculate readable Hive reputation from raw blockchain value
 */
function calculateHiveReputation(rawRep: number): string {
  if (rawRep === 0) return '25.00';
  const log = Math.log10(Math.abs(rawRep));
  const out = Math.max(log - 9, 0) * 9 + 25;
  return rawRep < 0 ? (50 - out).toFixed(2) : out.toFixed(2);
}

/**
 * Convert VESTS to HP using accurate global properties calculation
 */
function convertVestsToHp(vests: string, globalProps: any): string {
  try {
    const vestsAmount = parseFloat(vests.split(' ')[0] || '0');
    if (!globalProps || !globalProps.total_vesting_fund_hive || !globalProps.total_vesting_shares) {
      return '0.000';
    }
    const fund = parseFloat(globalProps.total_vesting_fund_hive.split(' ')[0] || '0');
    const totalVests = parseFloat(globalProps.total_vesting_shares.split(' ')[0] || '0');
    if (totalVests === 0) {
      return '0.000';
    }
    const hp = (vestsAmount * fund) / totalVests;
    return hp.toFixed(3);
  } catch {
    return '0.000';
  }
}
