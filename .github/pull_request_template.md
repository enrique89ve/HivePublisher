---
name: Pull Request
about: Submit changes to HiveTS
title: ''
labels: []
assignees: ''
---

## 📋 Description

Brief description of changes made in this PR.

**Related Issue:** Fixes #(issue number)

## 🔄 Type of Change

Please check the type of change your PR introduces:

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📚 Documentation update (changes to documentation only)
- [ ] 🔧 Refactoring (code changes that neither fix a bug nor add a feature)
- [ ] ⚡ Performance improvement
- [ ] 🧪 Test updates (adding missing tests or correcting existing tests)
- [ ] 🔨 Build/CI changes
- [ ] 🧹 Code cleanup

## 🧪 Testing

- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] I have tested this change manually
- [ ] I have tested this change against a live Hive node (if applicable)

### Test Results

```bash
# Paste test results here
npm test
```

## 📝 Checklist

- [ ] My code follows the project's coding standards
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added JSDoc comments for new public APIs
- [ ] I have updated the CHANGELOG.md (if applicable)
- [ ] I have added appropriate labels to this PR

## 📊 Performance Impact

If your change has performance implications:

- [ ] No performance impact
- [ ] Performance improvement (please describe)
- [ ] Performance regression (please justify)

**Benchmark Results (if applicable):**
```
Before: [time/memory usage]
After:  [time/memory usage]
```

## 💥 Breaking Changes

If this is a breaking change:

- [ ] I have updated the major version in package.json
- [ ] I have documented the breaking changes in CHANGELOG.md
- [ ] I have provided migration instructions

**Migration Guide:**
```typescript
// Before
oldAPI();

// After
newAPI();
```

## 📚 Documentation

- [ ] I have updated relevant documentation
- [ ] I have added JSDoc comments for new functions/classes
- [ ] I have updated the README.md (if applicable)
- [ ] I have added examples for new features

## 🔗 Dependencies

- [ ] No new dependencies added
- [ ] New dependencies added (please list and justify):
  - `dependency-name`: Reason for adding

## 📸 Screenshots/Examples

If applicable, add screenshots or code examples that demonstrate the changes:

```typescript
// Example usage of new feature
import { newFeature } from 'hivets';

const result = await newFeature({
  // example usage
});
```

## 🤝 Reviewer Notes

Any specific areas you'd like reviewers to focus on:

- [ ] Code quality and style
- [ ] Performance implications
- [ ] Security considerations
- [ ] API design
- [ ] Test coverage
- [ ] Documentation clarity

**Special Instructions:**
<!-- Any special instructions for reviewers -->

---

**By submitting this pull request, I confirm that:**
- [ ] I have read and agree to the project's contributing guidelines
- [ ] My contributions are my own work or properly attributed
- [ ] I agree to license my contributions under the project's license terms
