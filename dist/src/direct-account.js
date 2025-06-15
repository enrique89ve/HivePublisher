/**
 * Direct account information retrieval using proven API calls
 */
import { HiveError } from './types.js';
import { validateUsername } from './utils.js';
/**
 * Get complete account information using direct fetch calls
 */
export async function getAccountInfoDirect(username, apiNode = 'https://rpc.mahdiyari.info') {
    try {
        // Validate username format
        if (!validateUsername(username)) {
            throw new HiveError('Invalid username format');
        }
        // Get account data using proven working format
        const accountPayload = {
            jsonrpc: '2.0',
            method: 'condenser_api.get_accounts',
            params: [[username]],
            id: 1
        };
        const accountResponse = await fetch(apiNode, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(accountPayload)
        });
        if (!accountResponse.ok) {
            throw new HiveError(`HTTP ${accountResponse.status}: ${accountResponse.statusText}`);
        }
        const accountData = await accountResponse.json();
        if (accountData.error) {
            throw new HiveError(accountData.error.message);
        }
        const account = accountData.result[0];
        if (!account) {
            return null; // Account not found
        }
        // Get follow count data
        let followData = { follower_count: 0, following_count: 0 };
        try {
            const followPayload = {
                jsonrpc: '2.0',
                method: 'follow_api.get_follow_count',
                params: [username],
                id: 2
            };
            const followResponse = await fetch(apiNode, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(followPayload)
            });
            if (followResponse.ok) {
                const followResult = await followResponse.json();
                if (!followResult.error) {
                    followData = followResult.result;
                }
            }
        }
        catch (error) {
            // Follow API might not be available
        }
        // Get global properties for VESTS conversion
        const globalPropsPayload = {
            jsonrpc: '2.0',
            method: 'condenser_api.get_dynamic_global_properties',
            params: [],
            id: 3
        };
        const globalPropsResponse = await fetch(apiNode, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(globalPropsPayload)
        });
        let globalProps = null;
        if (globalPropsResponse.ok) {
            const globalPropsData = await globalPropsResponse.json();
            if (!globalPropsData.error) {
                globalProps = globalPropsData.result;
            }
        }
        // Transform account data to our AccountInfo interface
        const accountInfo = {
            id: account.id || 0,
            name: account.name || username,
            block_num: 0,
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
    }
    catch (error) {
        if (error instanceof HiveError) {
            throw error;
        }
        throw new HiveError(`Failed to get account info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
/**
 * Parse JSON safely
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
 * Convert VESTS to HP using global properties
 */
function convertVestsToHp(vests, globalProps) {
    try {
        const vestsAmount = parseFloat(vests.split(' ')[0] || '0');
        if (vestsAmount === 0)
            return '0.000';
        if (!globalProps) {
            // Fallback calculation
            const hp = vestsAmount / 2000;
            return hp.toFixed(3);
        }
        const totalVestingFund = parseFloat(globalProps.total_vesting_fund_hive?.split(' ')[0] || '0');
        const totalVestingShares = parseFloat(globalProps.total_vesting_shares?.split(' ')[0] || '1');
        if (totalVestingShares === 0)
            return '0.000';
        const hp = (vestsAmount * totalVestingFund) / totalVestingShares;
        return hp.toFixed(3);
    }
    catch (error) {
        // Fallback calculation
        const vestsAmount = parseFloat(vests.split(' ')[0] || '0');
        const hp = vestsAmount / 2000;
        return hp.toFixed(3);
    }
}
//# sourceMappingURL=direct-account.js.map