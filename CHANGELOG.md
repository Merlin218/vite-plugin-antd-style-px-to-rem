# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-XX

### Added
- ✨ Initial release of vite-plugin-antd-style-px-to-rem
- 🎯 Smart detection of antd-style CSS template literals
- 🔧 Support for `createStyles` function conversion
- 🎨 Optional JSX attribute conversion
- 🚫 Ignore comments functionality with `/* antd-style-px-to-rem ignore */`
- 📱 Highly configurable options for responsive design
- ⚡ Fast processing optimized for development and build
- 🔍 Full TypeScript support with comprehensive type definitions
- 📦 Multiple output formats (CJS, ESM) with proper exports
- 🧪 Comprehensive test suite with high coverage
- 📚 Detailed documentation in English and Chinese

### Features
- **CSS Template Processing**: Automatically converts px to rem in CSS template literals
- **createStyles Support**: Processes object-style CSS definitions in createStyles functions
- **JSX Attributes**: Optional conversion of style attributes in JSX elements
- **Flexible Configuration**: Extensive options for customization
- **Property Filtering**: Selective conversion based on CSS property patterns
- **File Filtering**: Include/exclude specific files or patterns
- **Performance Optimized**: Efficient AST processing with minimal overhead
- **Development Friendly**: Detailed error messages and debugging support

### Technical Details
- Built with TypeScript for type safety
- Uses Babel AST for reliable code parsing and transformation
- Supports both CommonJS and ES modules
- Compatible with Vite 2.0+ and Node.js 14+
- Zero-dependency runtime (peer dependency on Vite only)
- Comprehensive test coverage with Vitest
- Automated CI/CD with GitHub Actions
- Code quality ensured with ESLint and Prettier 