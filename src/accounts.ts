/**
 * Hive blockchain account operations
 * Based on HAF SQL implementation for comprehensive account data
 */

import { HiveClient } from './hive-client.js';
import { AccountInfo, HiveError } from './types.js';
import { validateUsername } from './utils.js';

/**
 * Get complete account information from Hive blockchain
 */
export async function getAccountInfo(
  username: string,
  client?: HiveClient
): Promise<AccountInfo | null> {
  try {
    const hiveClient = client || new HiveClient();
    
    // Validate username format
    if (!validateUsername(username)) {
      throw new HiveError('Invalid username format');
    }

    // Get account data from Hive API
    const account = await hiveClient.getAccount(username);
    
    if (!account) {
      return null; // Account not found
    }

    // Get follow count data (with fallback if API unavailable)
    let followData = { follower_count: 0, following_count: 0 };
    try {
      followData = await hiveClient.getFollowCount(username);
    } catch (error) {
      // Follow API might not be available on all nodes
    }
    
    // Get global properties for accurate VESTS conversion
    const globalProps = await hiveClient.getDynamicGlobalProperties();

    // Transform condenser_api format to our AccountInfo interface
    const accountInfo: AccountInfo = {
      id: account.id || 0,
      name: account.name || username,
      block_num: 0, // Not available in basic account data
      last_vote_time: account.last_vote_time || '',
      last_root_post: account.last_root_post || '',
      last_post: account.last_post || '',
      total_posts: account.post_count?.toString() || '0',
      followers: followData.follower_count?.toString() || '0',
      followings: followData.following_count?.toString() || '0',
      reputation: parseReputation(account.reputation || '0'),
      incoming_vests: account.received_vesting_shares || '0.000000 VESTS',
      incoming_hp: convertVestsToHp(account.received_vesting_shares || '0.000000 VESTS', globalProps),
      outgoing_vests: account.delegated_vesting_shares || '0.000000 VESTS',
      outgoing_hp: convertVestsToHp(account.delegated_vesting_shares || '0.000000 VESTS', globalProps),
      creator: account.creator || '',
      created_at: account.created || '',
      owner: account.owner || { key_auths: [], account_auths: [], weight_threshold: 1 },
      active: account.active || { key_auths: [], account_auths: [], weight_threshold: 1 },
      posting: account.posting || { key_auths: [], account_auths: [], weight_threshold: 1 },
      memo_key: account.memo_key || '',
      json_metadata: parseJsonSafely(account.json_metadata) || {},
      posting_metadata: parseJsonSafely(account.posting_json_metadata) || { profile: {} },
      last_update: account.last_account_update || '',
      last_owner_update: account.last_owner_update || '',
      recovery: account.recovery_account || '',
      reward_hive_balance: account.reward_hive_balance || '0.000 HIVE',
      reward_hbd_balance: account.reward_hbd_balance || '0.000 HBD',
      reward_vests_balance: account.reward_vesting_balance || '0.000000 VESTS',
      reward_vests_balance_hp: convertVestsToHp(account.reward_vesting_balance || '0.000000 VESTS', globalProps),
      next_vesting_withdrawal: account.next_vesting_withdrawal || null,
      to_withdraw: account.to_withdraw?.toString() || '0.000000 VESTS',
      vesting_withdraw_rate: account.vesting_withdraw_rate || '0.000000 VESTS',
      withdrawn: account.withdrawn?.toString() || '0.000000 VESTS',
      withdraw_routes: account.withdraw_routes || null,
      proxy: account.proxy || null,
      pending_hive_savings_withdrawal: account.savings_withdraw_requests || null,
      pending_hbd_savings_withdrawal: account.savings_hbd_withdraw_requests || null
    };

    return accountInfo;

  } catch (error) {
    if (error instanceof HiveError) {
      throw error;
    }
    throw new HiveError(`Failed to get account info: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parse JSON safely, returning null if invalid
 */
function parseJsonSafely(jsonString: string): any {
  try {
    return JSON.parse(jsonString || '{}');
  } catch {
    return {};
  }
}

/**
 * Parse Hive reputation from raw value using proper algorithm
 */
function parseReputation(rep: string | number): string {
  const reputation = typeof rep === 'string' ? parseInt(rep) : rep;
  if (reputation === 0) return '25.00';
  
  const neg = reputation < 0;
  let reputationLevel = Math.log10(Math.abs(reputation));
  reputationLevel = Math.max(reputationLevel - 9, 0);
  
  if (reputationLevel < 0) reputationLevel = 0;
  if (neg) reputationLevel *= -1;
  
  reputationLevel = reputationLevel * 9 + 25;
  
  return reputationLevel.toFixed(2);
}

/**
 * Format NAI asset object to traditional string format
 */
function formatAssetAmount(asset: any, symbol?: string): string {
  if (!asset) return `0.000${symbol ? ' ' + symbol : ' VESTS'}`;
  
  if (typeof asset === 'string') return asset;
  
  if (asset.amount && asset.precision !== undefined) {
    const amount = parseFloat(asset.amount) / Math.pow(10, asset.precision);
    
    // Determine symbol from NAI
    let assetSymbol = symbol;
    if (!assetSymbol) {
      switch (asset.nai) {
        case '@@000000021': assetSymbol = 'HIVE'; break;
        case '@@000000013': assetSymbol = 'HBD'; break;
        case '@@000000037': assetSymbol = 'VESTS'; break;
        default: assetSymbol = 'UNKNOWN';
      }
    }
    
    const precision = asset.precision;
    return `${amount.toFixed(precision)} ${assetSymbol}`;
  }
  
  return `0.000${symbol ? ' ' + symbol : ' VESTS'}`;
}

/**
 * Convert VESTS to HP using accurate global properties calculation
 */
function convertVestsToHp(vests: string, globalProps: any): string {
  try {
    const vestsAmount = parseFloat(vests.split(' ')[0] || '0');
    if (vestsAmount === 0) return '0.000';
    
    // Handle both NAI format and traditional format for global properties
    let totalVestingFund = 0;
    let totalVestingShares = 1;
    
    if (globalProps.total_vesting_fund_hive?.amount) {
      totalVestingFund = parseFloat(globalProps.total_vesting_fund_hive.amount) / Math.pow(10, globalProps.total_vesting_fund_hive.precision);
    } else if (globalProps.total_vesting_fund_hive) {
      totalVestingFund = parseFloat(globalProps.total_vesting_fund_hive.split(' ')[0] || '0');
    }
    
    if (globalProps.total_vesting_shares?.amount) {
      totalVestingShares = parseFloat(globalProps.total_vesting_shares.amount) / Math.pow(10, globalProps.total_vesting_shares.precision);
    } else if (globalProps.total_vesting_shares) {
      totalVestingShares = parseFloat(globalProps.total_vesting_shares.split(' ')[0] || '1');
    }
    
    if (totalVestingShares === 0) return '0.000';
    
    const hp = (vestsAmount * totalVestingFund) / totalVestingShares;
    return hp.toFixed(3);
  } catch (error) {
    // Fallback calculation if global properties parsing fails
    const vestsAmount = parseFloat(vests.split(' ')[0] || '0');
    const hp = vestsAmount / 2000; // Approximate conversion
    return hp.toFixed(3);
  }
}