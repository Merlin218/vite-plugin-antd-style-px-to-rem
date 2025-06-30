# Contributing to vite-plugin-antd-style-px-to-rem

Thank you for your interest in contributing! This document outlines the development and release process for this project.

## 🚀 Development Setup

### Prerequisites

- Node.js 18+ 
- pnpm (recommended package manager)

### Getting Started

1. Fork and clone the repository:
```bash
git clone https://github.com/your-username/vite-plugin-antd-style-px-to-rem.git
cd vite-plugin-antd-style-px-to-rem
```

2. Install dependencies:
```bash
pnpm install
```

3. Build the project:
```bash
pnpm run build
```

4. Run tests:
```bash
pnpm run test
pnpm run test:coverage
```

5. Run type checking and linting:
```bash
pnpm run typecheck
pnpm run lint
```

## 📝 Commit Guidelines

This project uses [Conventional Commits](https://www.conventionalcommits.org/) for automated versioning and changelog generation.

### Using Commitizen

We recommend using commitizen for consistent commit messages:

```bash
# Instead of git commit
pnpm run commit
```

This will guide you through creating a properly formatted commit message.

### Commit Types

- **feat**: A new feature (triggers minor version bump)
- **fix**: A bug fix (triggers patch version bump)
- **perf**: Performance improvements (triggers patch version bump)
- **refactor**: Code refactoring (triggers patch version bump)
- **docs**: Documentation changes (triggers patch version bump for README changes)
- **test**: Adding or updating tests (no version bump)
- **build**: Build system changes (no version bump)
- **ci**: CI/CD changes (no version bump)
- **chore**: Other changes (no version bump)
- **revert**: Revert previous changes (triggers patch version bump)

### Breaking Changes

For breaking changes, add `BREAKING CHANGE:` in the commit body or add `!` after the type:

```
feat!: remove deprecated API

BREAKING CHANGE: The old API has been removed in favor of the new one.
```

This will trigger a major version bump.

### Examples

```bash
feat: add support for compiled JSX patterns
fix: handle edge case in CSS parsing
docs: update README with new examples
test: add tests for compiled JSX support
chore: update dependencies
```

## 🔄 Release Process

This project uses [semantic-release](https://semantic-release.gitbook.io/) for automated releases.

### Automatic Releases

Releases are automatically triggered when commits are pushed to specific branches:

- **main**: Production releases (latest)
- **beta**: Beta releases (beta tag)
- **alpha**: Alpha releases (alpha tag)

### Release Workflow

1. **Development**: Work on feature branches and create PRs to main
2. **CI/CD**: All PRs are tested against Node.js 18, 20, and 22
3. **Merge**: When PR is merged to main, the release workflow runs
4. **Analysis**: semantic-release analyzes commits since last release
5. **Version**: Calculates new version based on conventional commits
6. **Build**: Builds the package and runs all tests
7. **Publish**: Publishes to npm and creates GitHub release
8. **Changelog**: Updates CHANGELOG.md automatically

### Manual Release (Dry Run)

To test what the next release would look like:

```bash
pnpm run release:dry
```

### Pre-releases

To create pre-releases:

1. **Beta releases**: Push to `beta` branch
2. **Alpha releases**: Push to `alpha` branch

Example:
```bash
git checkout -b beta
git push origin beta  # Triggers beta release
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pnpm run test

# Run tests with coverage
pnpm run test:coverage

# Run tests in watch mode (development)
pnpm run test -- --watch
```

### Test Structure

- `__tests__/` - Test files using Vitest
- Tests cover various scenarios: CSS processing, JSX transforms, edge cases
- Aim for high test coverage (currently 100%+)

### Adding Tests

When adding new features:

1. Add test cases to existing test files or create new ones
2. Test both positive and negative scenarios
3. Include edge cases and error conditions
4. Update test documentation if needed

## 📁 Project Structure

```
├── src/
│   ├── index.ts              # Main plugin entry point
│   ├── types.ts              # TypeScript type definitions
│   ├── constants.ts          # Default configuration
│   ├── utils.ts              # Utility functions
│   └── processors/           # Processing modules
│       ├── ast-processor.ts  # AST processing
│       ├── css-processor.ts  # CSS processing
│       └── jsx-processor.ts  # JSX processing
├── __tests__/                # Test files
├── .github/workflows/        # CI/CD workflows
├── .releaserc.json          # Semantic-release configuration
└── dist/                    # Built files
```

## 🔧 Configuration Files

- `.releaserc.json` - Semantic-release configuration
- `tsup.config.ts` - Build configuration
- `vitest.config.ts` - Test configuration
- `tsconfig.json` - TypeScript configuration

## 📋 Pull Request Guidelines

1. **Fork** the repository and create a feature branch
2. **Write** meaningful commit messages using conventional commits
3. **Add** tests for new features or bug fixes
4. **Update** documentation if needed
5. **Ensure** all CI checks pass
6. **Keep** PRs focused and atomic

### PR Checklist

- [ ] Tests pass locally and in CI
- [ ] Code is properly formatted (`pnpm run format`)
- [ ] No linting errors (`pnpm run lint`)
- [ ] TypeScript compiles without errors (`pnpm run typecheck`)
- [ ] Documentation updated if needed
- [ ] Commit messages follow conventional commits

## 🚨 Troubleshooting

### Common Issues

1. **Tests failing**: Make sure dependencies are installed with `pnpm install`
2. **Build errors**: Check TypeScript version compatibility
3. **Release not triggered**: Ensure commit messages follow conventional format
4. **npm publish fails**: Check if NPM_TOKEN secret is configured

### Getting Help

- Open an issue for bugs or feature requests
- Check existing issues for similar problems
- Review the test suite for usage examples

## 🎯 Development Tips

1. **Use TypeScript**: All code should be properly typed
2. **Write tests**: Test-driven development is encouraged
3. **Performance**: Consider build performance impact
4. **Backward compatibility**: Avoid breaking changes when possible
5. **Documentation**: Keep docs up to date

Thank you for contributing! 🙌