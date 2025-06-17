**Hive Publisher** is an ultra-simple, enterprise-ready TypeScript library for interacting with the Hive blockchain. Get started with just:

```ts
import { HiveClient } from 'hive-publisher';
const client = new HiveClient(); // Mainnet by default
```

## Features

- Create, edit, and upvote posts
- Fetch account information and content
- Built-in types for TypeScript
- No external configuration required (environment variables optional)
- Supports CommonJS and ESM

## Installation

```bash
npm install hive-publisher
```

## Configuration

Hive Publisher uses environment variables to configure optional credentials and network settings. You can create a `.env` file in your project root with the following keys:

```dotenv
HIVE_USERNAME=your_hive_username        # optional: for operations requiring write access
HIVE_POSTING_KEY=your_posting_key       # optional: for operations requiring write access
HIVE_API_NODE=https://api.hive.blog     # optional: default Hive public node
HIVE_TESTNET=true                       # optional: set to `true` to use testnet
```

Alternatively, you can set these variables in your shell or pass a custom config when creating the client:

```ts
const client = new HiveClient({
  apiNode: 'https://api.hive.blog',
  mainnet: true,           // or false for testnet
  timeout: 30000,          // optional: request timeout in ms
  maxRetries: 3,           // optional: number of retry attempts
});
```

## Usage

### CommonJS (Node.js)

```js
const {
  HiveClient,
  createPost,
  editPost,
  upvote,
  getAccountInfo,
  getPostContent,
  getComments,
} = require('hive-publisher');

(async () => {
  const client = new HiveClient({ testnet: true });
  const account = await getAccountInfo('username');
  console.log('Reputation:', account.reputation);

  const postResult = await createPost({
    title: 'Hello Hive',
    body: 'This is a post using Hive Publisher',
    tags: ['hive', 'typescript'],
  });
  console.log('Post created:', postResult);
})();
```

### ESM / TypeScript

```ts
import {
  HiveClient,
  createPost,
  editPost,
  upvote,
  getAccountInfo,
  getPostContent,
  getComments,
} from 'hive-publisher';

const client = HiveClient.create({ mainnet: true });

async function run() {
  const info = await getAccountInfo('username');
  console.log(info);

  const post = await createPost({
    title: 'My Title',
    body: 'Content here',
    tags: ['tag1', 'tag2'],
  });
  console.log(post);
}

run();
```

### API Overview

#### HiveClient

- `new HiveClient(config?: HiveConfig)`
- `HiveClient.create(config?)`
- `HiveClient.mainnet(config?)`
- `HiveClient.testnet(config?)`
- `.on(event, listener)` for health monitoring

#### Operations

- `createPost(options: CreatePostOptions)`
- `editPost(options: EditPostOptions)`
- `upvote(options: VoteOptions)`
- `getAccountInfo(username: string)`
- `getReputation(username: string)`
- `getPostContent(permlink: string)`
- `getComments(permlink: string)`

## Scripts

- `npm run build` – Build CJS and ESM bundles
- `npm test` – Run tests (Jest)
- `npm run lint` – Lint source files
- `npm run format` – Format code with Prettier
- `npm run docs` – Generate API docs (Typedoc)

## Contributing

Contributions are welcome! Please open issues or pull requests for improvements.

