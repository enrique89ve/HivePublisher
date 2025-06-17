# AI Prompt for the HivePublisher Library

## Context
You are an AI (or MCP agent) expert in TypeScript and the Hive blockchain. Your task is to analyze, understand, and assist in using the **HivePublisher** library, designed to interact with the Hive blockchain.

## Prerequisites
- A `.env` file in the project root. Copy from `.env.example` and fill in your environment variables (e.g., HIVE_USERNAME, HIVE_POSTING_KEY, HIVE_API_NODE).

## Project Structure
- **src/index.ts**: Entry point exposing the public API.
- **src/accounts.ts**: User account management (create, load keys).
- **src/config.ts**: Configuration loading and validation (env, JSON).
- **src/content.ts**: Functions to build and format content (posts, comments).
- **src/crypto.ts**: Cryptographic utilities (signing, hashing).
- **src/hive-client.ts**: HTTP/RPC client to connect to Hive nodes.
- **src/operations.ts**: High-level operations (publish post, vote, transfers).
- **src/utils.ts**: General helpers (dates, parsing).
- **src/types.ts**: TypeScript type definitions.

## AI Objectives
- **Understand** the public API and library architecture.
- **Document** functions, classes, and usage flows.
- **Suggest** code, performance, and security improvements.
- **Generate** usage examples (snippets in TS/JS).
- **Answer** questions about configurations, errors, and deployment.

## Usage Examples
```typescript
import { HivePublisher } from 'hive-publisher';

async function example() {
  const hp = new HivePublisher({
    node: 'https://api.hive.blog',
    account: 'myUser',
    key: process.env.ACTIVE_KEY
  });

  // Create a post
  const result = await hp.posts.create({
    title: 'Hello Hive',
    body: 'This is a sample post.'
  });
  console.log(result);
}
```

## Frequently Asked Questions for the AI
1. How to configure connection to an alternative node?
2. How to manually sign a transaction?
3. Which modules should I import to vote?
4. How to handle network errors or signature rejection?

