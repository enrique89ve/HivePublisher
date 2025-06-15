/**
 * Content reading demonstration - getPostContent and getComments
 * Shows how to retrieve and display post content and comments
 */
import { HiveClient, getPostContent, getComments, getAccountInfo } from '../src/index.js';
async function contentDemo() {
    console.log('📚 HiveTS Content Reading Demo\n');
    try {
        const client = new HiveClient({ mainnet: true });
        // Get account info to find recent posts
        console.log('📊 Getting account information for theycallmedan...');
        const account = await getAccountInfo('theycallmedan', client);
        if (account && account.last_post) {
            console.log(`✅ Account found with ${account.total_posts} posts`);
            console.log(`Last post: ${account.last_post}`);
        }
        // Test with a known high-engagement account and try common post patterns
        console.log('\n🔍 Testing getPostContent function...');
        // Test error handling with invalid inputs
        console.log('\n🚨 Testing error handling...');
        try {
            await getPostContent('', 'test');
        }
        catch (error) {
            console.log('✅ Empty username correctly rejected:', error.message);
        }
        try {
            await getPostContent('testuser', '');
        }
        catch (error) {
            console.log('✅ Empty permlink correctly rejected:', error.message);
        }
        // Test with non-existent post
        console.log('\n🔍 Testing with non-existent post...');
        const nullResult = await getPostContent('nonexistentuser123', 'fake-post-456');
        if (nullResult === null) {
            console.log('✅ Non-existent post correctly returns null');
        }
        // Test getComments with non-existent post
        console.log('\n💬 Testing getComments with non-existent post...');
        const emptyComments = await getComments('nonexistentuser123', 'fake-post-456');
        console.log(`✅ Non-existent post returns empty array: ${emptyComments.length} comments`);
        // Try to find any existing post using alternative API approach
        console.log('\n🔍 Searching for real posts using get_discussions_by_author...');
        try {
            const discussions = await client.call('condenser_api.get_discussions_by_author_before_date', [
                'theycallmedan', '', new Date().toISOString(), 5
            ]);
            if (discussions && discussions.length > 0) {
                const recentPost = discussions[0];
                console.log(`✅ Found recent post: "${recentPost.title}"`);
                console.log(`Permlink: ${recentPost.permlink}`);
                console.log(`Comments: ${recentPost.children}`);
                // Test getPostContent with real post
                console.log('\n📄 Testing getPostContent with real post...');
                const postContent = await getPostContent(recentPost.author, recentPost.permlink);
                if (postContent) {
                    console.log('✅ Post content retrieved successfully:');
                    console.log(`- Title: ${postContent.title}`);
                    console.log(`- Author: @${postContent.author}`);
                    console.log(`- Created: ${postContent.created}`);
                    console.log(`- Net votes: ${postContent.net_votes}`);
                    console.log(`- Total payout: ${postContent.total_payout_value}`);
                    console.log(`- Body length: ${postContent.body.length} characters`);
                    console.log(`- Children: ${postContent.children}`);
                    // Test getComments with real post
                    if (postContent.children > 0) {
                        console.log('\n💬 Testing getComments with real post...');
                        const comments = await getComments(postContent.author, postContent.permlink);
                        console.log(`✅ Retrieved ${comments.length} comments`);
                        if (comments.length > 0) {
                            console.log('\nFirst few comments:');
                            comments.slice(0, 3).forEach((comment, index) => {
                                console.log(`${index + 1}. @${comment.author}:`);
                                console.log(`   Created: ${comment.created}`);
                                console.log(`   Votes: ${comment.net_votes}`);
                                console.log(`   Body: ${comment.body.substring(0, 100)}...`);
                            });
                        }
                    }
                    else {
                        console.log('📝 Post has no comments to test with');
                    }
                }
            }
            else {
                console.log('ℹ️  No recent posts found for testing');
            }
        }
        catch (error) {
            console.log('⚠️  Alternative API approach failed:', error.message);
        }
        console.log('\n🎯 Content reading demo completed!');
        console.log('\n✅ Functions tested:');
        console.log('- getPostContent(): Retrieves complete post data');
        console.log('- getComments(): Retrieves post comments');
        console.log('- Error handling for invalid inputs');
        console.log('- Null handling for non-existent content');
    }
    catch (error) {
        console.log('❌ Demo failed:', error.message);
    }
}
// Run the demo
contentDemo().catch(console.error);
//# sourceMappingURL=content-demo.js.map