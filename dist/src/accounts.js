/**
 * Hive blockchain account operations
 */
import { HiveClient } from './hive-client.js';
import { HiveError } from './types.js';
import { validateUsername } from './utils.js';
/**
 * Get complete account information from Hive blockchain
 */
export async function getAccountInfo(username, client) {
    try {
        const hiveClient = client || new HiveClient();
        // Validate username
        if (!validateUsername(username)) {
            throw new HiveError('Invalid username format');
        }
        // Get account data from Hive API
        const accounts = await hiveClient.getAccountInfo(username);
        if (!accounts || accounts.length === 0) {
            return null; // Account not found
        }
        const account = accounts[0];
        // Map the response to our AccountInfo interface
        const accountInfo = {
            id: account.id,
            name: account.name,
            block_num: account.block_num || 0,
            last_vote_time: account.last_vote_time || '',
            last_root_post: account.last_root_post || '',
            last_post: account.last_post || '',
            total_posts: account.post_count?.toString() || '0',
            followers: account.follower_count?.toString() || '0',
            followings: account.following_count?.toString() || '0',
            reputation: parseReputation(account.reputation || '0'),
            incoming_vests: account.delegated_vesting_shares || '0.000000 VESTS',
            incoming_hp: convertVestsToHp(account.delegated_vesting_shares || '0.000000 VESTS'),
            outgoing_vests: account.vesting_shares || '0.000000 VESTS',
            outgoing_hp: convertVestsToHp(account.vesting_shares || '0.000000 VESTS'),
            creator: account.creator || '',
            created_at: account.created || '',
            owner: account.owner,
            active: account.active,
            posting: account.posting,
            memo_key: account.memo_key || '',
            json_metadata: parseJsonSafely(account.json_metadata) || {},
            posting_metadata: parseJsonSafely(account.posting_json_metadata) || { profile: {} },
            last_update: account.last_account_update || '',
            last_owner_update: account.last_owner_update || '',
            recovery: account.recovery_account || '',
            reward_hive_balance: account.reward_hive_balance || '0.000 HIVE',
            reward_hbd_balance: account.reward_hbd_balance || '0.000 HBD',
            reward_vests_balance: account.reward_vesting_balance || '0.000000 VESTS',
            reward_vests_balance_hp: convertVestsToHp(account.reward_vesting_balance || '0.000000 VESTS'),
            next_vesting_withdrawal: account.next_vesting_withdrawal || null,
            to_withdraw: account.to_withdraw || '0.000000 VESTS',
            vesting_withdraw_rate: account.vesting_withdraw_rate || '0.000000 VESTS',
            withdrawn: account.withdrawn || '0.000000 VESTS',
            withdraw_routes: account.withdraw_routes || null,
            proxy: account.proxy || null,
            pending_hive_savings_withdrawal: account.savings_withdraw_requests || null,
            pending_hbd_savings_withdrawal: account.savings_hbd_withdraw_requests || null
        };
        return accountInfo;
    }
    catch (error) {
        throw new HiveError(`Failed to get account info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
/**
 * Parse JSON safely, returning null if invalid
 */
function parseJsonSafely(jsonString) {
    try {
        return JSON.parse(jsonString || '{}');
    }
    catch {
        return {};
    }
}
/**
 * Parse Hive reputation from raw value
 */
function parseReputation(rep) {
    const reputation = typeof rep === 'string' ? parseInt(rep) : rep;
    if (reputation === 0)
        return '25.00';
    const neg = reputation < 0;
    let reputationLevel = Math.log10(Math.abs(reputation));
    reputationLevel = Math.max(reputationLevel - 9, 0);
    if (reputationLevel < 0)
        reputationLevel = 0;
    if (neg)
        reputationLevel *= -1;
    reputationLevel = reputationLevel * 9 + 25;
    return reputationLevel.toFixed(2);
}
/**
 * Convert VESTS to approximate HP (simplified calculation)
 */
function convertVestsToHp(vests) {
    const vestsAmount = parseFloat(vests.split(' ')[0] || '0');
    // Simplified conversion rate (actual rate varies)
    const hpAmount = vestsAmount / 1000000 * 500; // Approximate conversion
    return hpAmount.toFixed(3);
}
//# sourceMappingURL=accounts.js.map