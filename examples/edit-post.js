/**
 * Post Editing Example
 *
 * This example shows how to edit existing posts with different modes.
 */

import { editPost } from 'hive-publisher';

async function editPostExample() {
  const permlink = 'my-existing-post';

  try {
    // 1. Append mode - Add content to the end
    const appendResult = await editPost(permlink, {
      newContent: '\n\n**Update:** Added new information!',
      mode: 'append',
    });

    // 2. Prepend mode - Add content to the beginning
    const prependResult = await editPost(permlink, {
      newContent: '**Important Notice:** This post has been updated.\n\n',
      mode: 'prepend',
    });

    // 3. Replace mode - Replace entire content
    const replaceResult = await editPost(permlink, {
      title: 'Updated Title',
      newContent: 'This is the completely new content.',
      mode: 'replace',
    });

    console.log('✅ Post editing examples completed');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the example
editPostExample();
