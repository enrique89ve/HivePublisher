# Contributing to HiveTS

Thank you for your interest in contributing to HiveTS! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Submitting Changes](#submitting-changes)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Release Process](#release-process)

## 📜 Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code:

- **Be respectful** and inclusive in your interactions
- **Be collaborative** and constructive in discussions
- **Be patient** with newcomers and those learning
- **Focus on the project goals** and technical merit
- **Report unacceptable behavior** to the maintainers

## 🚀 Getting Started

### Prerequisites

- Node.js 16.0.0 or higher
- npm 8.0.0 or higher
- Git

### Setting Up Development Environment

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/hivets.git
   cd hivets
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Set up environment variables** (optional, for testing):
   ```bash
   cp .env.example .env
   # Edit .env with your test credentials if needed
   ```

5. **Verify setup**:
   ```bash
   npm run build
   npm test
   npm run lint
   ```

## 🔄 Development Workflow

### Branch Strategy

- `main` - Stable release branch
- `develop` - Integration branch for new features
- `feature/feature-name` - Feature development branches
- `bugfix/issue-number` - Bug fix branches
- `hotfix/issue-number` - Critical hotfix branches

### Making Changes

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make your changes** following our coding standards

3. **Write tests** for your changes:
   ```bash
   npm test
   ```

4. **Ensure code quality**:
   ```bash
   npm run validate
   ```

5. **Commit your changes**:
   ```bash
   git commit -m "feat: add amazing feature"
   ```

### Commit Message Convention

We use [Conventional Commits](https://conventionalcommits.org/) for commit messages:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add support for custom metadata in posts
fix: handle network timeout errors gracefully
docs: update API documentation for vote function
test: add integration tests for post creation
```

## 📤 Submitting Changes

### Pull Request Process

1. **Push your branch** to your fork:
   ```bash
   git push origin feature/amazing-feature
   ```

2. **Create a Pull Request** on GitHub with:
   - Clear title describing the change
   - Detailed description of what and why
   - Reference to any related issues
   - Screenshots or examples if applicable

3. **Ensure all checks pass**:
   - All tests pass
   - Code coverage maintained
   - Linting passes
   - Build succeeds

4. **Address feedback** from reviewers promptly

5. **Squash commits** if requested before merging

### PR Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] I have tested this change against a live Hive node

## Checklist
- [ ] My code follows the project's coding standards
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
```

## 🎯 Coding Standards

### TypeScript Guidelines

- **Use strict TypeScript** - All code must pass `strict: true`
- **Prefer explicit types** over `any` or `unknown`
- **Use interfaces** for object shapes
- **Document public APIs** with JSDoc comments
- **Export types** that consumers might need

### Code Style

We use Prettier and ESLint for consistent code style:

```bash
# Format code
npm run format

# Lint code
npm run lint

# Fix auto-fixable lint issues
npm run lint:fix
```

### File Organization

```
src/
├── index.ts          # Main exports
├── types.ts          # Type definitions
├── hive-client.ts    # Core client
├── operations.ts     # Write operations
├── accounts.ts       # Account operations
├── content.ts        # Content operations
├── crypto.ts         # Cryptographic functions
└── utils.ts          # Utility functions
```

### Naming Conventions

- **Files**: kebab-case (`hive-client.ts`)
- **Functions**: camelCase (`createPost`)
- **Classes**: PascalCase (`HiveClient`)
- **Constants**: UPPER_SNAKE_CASE (`ERROR_CODES`)
- **Interfaces**: PascalCase (`HiveConfig`)
- **Types**: PascalCase (`ErrorCode`)

## 🧪 Testing Guidelines

### Test Structure

```typescript
describe('Feature', () => {
  describe('specific function', () => {
    test('should do something specific', () => {
      // Arrange
      const input = 'test-input';
      
      // Act
      const result = functionUnderTest(input);
      
      // Assert
      expect(result).toBe('expected-output');
    });
  });
});
```

### Testing Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific test file
npm test -- utils.test.ts
```

### Test Categories

1. **Unit Tests** - Test individual functions in isolation
2. **Integration Tests** - Test combinations of functions
3. **API Tests** - Test against live Hive nodes (optional)

### Mocking Guidelines

- Mock external dependencies (network calls, crypto operations)
- Use Jest mocks for consistent behavior
- Provide both success and error scenarios
- Test edge cases and boundary conditions

## 📚 Documentation

### JSDoc Comments

All public APIs must have JSDoc documentation:

```typescript
/**
 * Creates a new post on the Hive blockchain
 * 
 * @param credentials - User credentials for authentication
 * @param metadata - Post content and metadata
 * @param client - Optional custom client configuration
 * @returns Promise that resolves to the publish result
 * 
 * @example
 * ```typescript
 * const result = await createPost(
 *   { username: 'alice', postingKey: 'key...' },
 *   { title: 'Hello', body: 'World', tags: ['test'] }
 * );
 * ```
 */
export async function createPost(
  credentials: HiveCredentials,
  metadata: PostMetadata,
  client?: HiveClient
): Promise<PublishResult> {
  // Implementation
}
```

### README Updates

When adding new features:
1. Update the API reference section
2. Add relevant examples
3. Update the feature list
4. Consider adding a migration note if breaking

### Documentation Build

```bash
# Generate TypeDoc documentation
npm run docs
```

## 🚢 Release Process

### Version Management

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality
- **PATCH** version for backwards-compatible bug fixes

### Release Checklist

1. **Update version** in `package.json`
2. **Update CHANGELOG.md** with release notes
3. **Run full test suite**: `npm run validate`
4. **Build for production**: `npm run build`
5. **Create git tag**: `git tag v1.2.3`
6. **Push changes**: `git push origin main --tags`
7. **Publish to npm**: `npm publish`
8. **Create GitHub release** with changelog

### Pre-release Testing

Before major releases:
- Test against multiple Hive nodes
- Verify backwards compatibility
- Check bundle size impact
- Review security implications

## 🐛 Reporting Issues

### Bug Reports

When reporting bugs, please include:

1. **Clear description** of the issue
2. **Steps to reproduce** the problem
3. **Expected behavior** vs actual behavior
4. **Environment details** (Node.js version, OS, etc.)
5. **Code examples** or minimal reproduction
6. **Error messages** or stack traces

### Feature Requests

For new features:

1. **Describe the use case** and problem it solves
2. **Propose API design** if applicable
3. **Consider backwards compatibility**
4. **Discuss performance implications**
5. **Reference related issues** or discussions

## 🏆 Recognition

Contributors are recognized in:

- **README.md** contributors section
- **GitHub releases** acknowledgments
- **Package.json** contributors field
- **Special mentions** for significant contributions

## 📞 Getting Help

- **GitHub Discussions** - General questions and ideas
- **GitHub Issues** - Bug reports and feature requests
- **Email** - security@hivets.dev for security issues
- **Discord** - Community chat (coming soon)

Thank you for contributing to HiveTS! 🎉
