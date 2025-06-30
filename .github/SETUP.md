# Repository Setup Guide

This guide explains how to set up the required secrets and configurations for automated releases.

## Required Secrets

Add these secrets to your GitHub repository settings (Settings → Secrets and variables → Actions):

### 1. NPM_TOKEN
- **Purpose**: Publishing packages to npm registry
- **How to get**:
  1. Log in to [npmjs.com](https://www.npmjs.com/)
  2. Go to Profile → Access Tokens
  3. Generate new token with "Automation" type
  4. Copy the token

### 2. GH_TOKEN (Optional but recommended)
- **Purpose**: Creating GitHub releases and pushing changelog commits
- **Default**: If not provided, uses `GITHUB_TOKEN` (automatic)
- **How to get** (for enhanced permissions):
  1. Go to GitHub → Settings → Developer settings → Personal access tokens
  2. Generate new token (classic) with these scopes:
     - `repo` (full repository access)
     - `write:packages` (if you use GitHub packages)
  3. Copy the token

### 3. CODECOV_TOKEN (Optional)
- **Purpose**: Uploading test coverage reports
- **How to get**:
  1. Sign up at [codecov.io](https://codecov.io/)
  2. Add your repository
  3. Copy the repository token

## Branch Protection Rules

Set up branch protection for `main` branch:

1. Go to Settings → Branches
2. Add rule for `main` branch
3. Enable:
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Select status checks: CI tests
   - ✅ Restrict pushes that create files larger than 100MB
   - ✅ Require linear history (optional)

## Release Branches

The semantic-release workflow supports these branches:

- **`main`**: Production releases (latest tag)
- **`beta`**: Beta releases (beta tag)  
- **`alpha`**: Alpha releases (alpha tag)

## First Release

For the first release after setup:

1. Ensure all secrets are configured
2. Make a commit with conventional format:
   ```bash
   git commit -m "feat: add semantic-release workflow"
   ```
3. Push to main branch
4. The release workflow will automatically:
   - Determine version based on commits
   - Build and test the package
   - Publish to npm
   - Create GitHub release
   - Update CHANGELOG.md

## Troubleshooting

### Common Issues

1. **"No GitHub token specified"**
   - Add `GH_TOKEN` secret or verify `GITHUB_TOKEN` permissions

2. **"Unable to publish package"**
   - Verify `NPM_TOKEN` is valid and has publish permissions
   - Check package name is available on npm

3. **"No release published"**
   - Ensure commits follow conventional commit format
   - Check if version bump is needed (feat/fix/BREAKING CHANGE)

4. **"Tests failing in CI"**
   - Verify all tests pass locally: `pnpm run test`
   - Check Node.js version compatibility

### Debug Mode

To debug releases locally (limited functionality):

```bash
# Test what would be released (requires GitHub token)
GITHUB_TOKEN=your-token pnpm run release:dry

# Test commit analysis only
npx semantic-release --dry-run --no-ci
```

## Verification

After setup, verify the workflow:

1. Create a test PR with conventional commit
2. Merge to main branch
3. Check GitHub Actions for successful release
4. Verify package published to npm
5. Check GitHub releases for changelog

## Support

- [Semantic Release Documentation](https://semantic-release.gitbook.io/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)