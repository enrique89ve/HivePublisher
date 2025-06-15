# Changelog

All notable changes to HiveTS will be documented in this file.

## [1.0.0] - 2025-01-15

### Added
- Initial release of HiveTS library
- Core operations: `createPost`, `editPost`, `upvote`
- Account information retrieval with `getAccountInfo`
- Configurable `HiveClient` with custom API endpoints
- Comprehensive TypeScript type definitions
- JSDoc documentation for all public APIs
- Professional error handling with structured results
- Production-ready cryptographic operations using hive-tx
- Complete example suite demonstrating all functionality

### Features
- **TypeScript Native**: Full type safety and IntelliSense support
- **Minimal Dependencies**: Only essential cryptographic libraries
- **Production Ready**: Battle-tested with real blockchain transactions
- **Developer Friendly**: Clear APIs and comprehensive error handling
- **Flexible**: Configurable API endpoints and timeout settings

### Examples Included
- `account-info.ts` - Account data retrieval patterns
- `create-post.ts` - Content publishing workflows
- `edit-post.ts` - Post modification operations
- `upvote-post.ts` - Voting functionality
- `error-handling.ts` - Error management best practices
- `custom-client.ts` - Advanced client configuration
- `comprehensive-demo.ts` - Complete library demonstration

### Technical Highlights
- Zero mock data - all operations use authentic Hive blockchain
- Robust API format handling with proper HTTP client implementation
- Automatic percentage-to-weight conversion for voting
- Comprehensive input validation and sanitization
- Support for custom RPC endpoints and timeout configuration