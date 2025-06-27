# vite-plugin-antd-style-px-to-rem

[![npm version](https://badge.fury.io/js/vite-plugin-antd-style-px-to-rem.svg)](https://badge.fury.io/js/vite-plugin-antd-style-px-to-rem)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Vite plugin that automatically converts `px` values to `rem` units in antd-style CSS template literals, `createStyles` functions, and JSX attributes during build time. This plugin helps create responsive designs by making pixel values relative to the root font size.

## ✨ Features

- 🎯 **Smart Detection**: Automatically detects and processes antd-style CSS templates
- 🔧 **Flexible Configuration**: Highly customizable with extensive options
- 🎨 **Multiple Targets**: Supports CSS templates, `createStyles` functions, and JSX attributes
- 🚫 **Ignore Comments**: Skip conversion with `/* antd-style-px-to-rem ignore */` comments
- 📱 **Responsive Ready**: Perfect for building responsive web applications
- ⚡ **Fast Processing**: Optimized for development and build performance
- 🔍 **TypeScript Support**: Full TypeScript support with type definitions

## 📦 Installation

```bash
# npm
npm install vite-plugin-antd-style-px-to-rem --save-dev

# yarn
yarn add vite-plugin-antd-style-px-to-rem --dev

# pnpm
pnpm add vite-plugin-antd-style-px-to-rem --save-dev
```

## 🚀 Quick Start

### Basic Setup

Add the plugin to your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import { antdStylePxToRem } from 'vite-plugin-antd-style-px-to-rem'

export default defineConfig({
  plugins: [
    antdStylePxToRem({
      rootValue: 16,        // 1rem = 16px
      unitPrecision: 5,     // precision of rem values
      propList: ['*'],      // properties to convert
      minPixelValue: 1,     // minimum px value to convert
    })
  ]
})
```

### Usage Examples

The plugin automatically processes various antd-style patterns:

#### CSS Template Literals

```typescript
import { createStyles } from 'antd-style'

const useStyles = createStyles(({ css }) => ({
  container: css`
    width: 320px;        /* → width: 20rem; */
    height: 240px;       /* → height: 15rem; */
    padding: 16px 24px;  /* → padding: 1rem 1.5rem; */
    margin: 8px;         /* → margin: 0.5rem; */
  `
}))
```

#### createStyles Function

```typescript
import { createStyles } from 'antd-style'

const useStyles = createStyles(({ token }) => ({
  header: {
    fontSize: 18,          // → fontSize: '1.125rem'
    lineHeight: 24,        // → lineHeight: '1.5rem'
    padding: '12px 16px',  // → padding: '0.75rem 1rem'
  },
  content: {
    width: '100%',
    minHeight: 480,        // → minHeight: '30rem'
  }
}))
```

#### JSX Attributes (Optional)

```jsx
// When enableJSXTransform is true
<div style={{ width: 320, height: 240 }}>
  {/* → style={{ width: '20rem', height: '15rem' }} */}
</div>

<Flex gap={16}>
  {/* → <Flex gap="1rem"> */}
</Flex>
```

## ⚙️ Configuration Options

### AntdStylePxToRemOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `rootValue` | `number` | `16` | Root font size (1rem = rootValue px) |
| `unitPrecision` | `number` | `5` | Decimal precision for rem values |
| `minPixelValue` | `number` | `0` | Minimum pixel value to convert |
| `propList` | `string[]` | `['*']` | CSS properties to convert |
| `selectorBlackList` | `(string \| RegExp)[]` | `[]` | Selectors to ignore (future use) |
| `replace` | `boolean` | `true` | Replace original values or add alongside |
| `mediaQuery` | `boolean` | `false` | Convert px in media queries |
| `include` | `string \| RegExp \| (string \| RegExp)[]` | `undefined` | Files to include |
| `exclude` | `string \| RegExp \| (string \| RegExp)[]` | `undefined` | Files to exclude |
| `cssTemplateFunctions` | `string[]` | `['css']` | CSS template function names to process |
| `enableJSXTransform` | `boolean` | `true` | Enable JSX attribute conversion |

### Advanced Configuration

```typescript
export default defineConfig({
  plugins: [
    antdStylePxToRem({
      // Basic settings
      rootValue: 16,
      unitPrecision: 5,
      minPixelValue: 1,
      
      // Property filtering
      propList: [
        '*',                    // Convert all properties
        '!border*',            // Except border properties
        '!outline*'            // Except outline properties
      ],
      
      // File filtering
      include: [/\.tsx?$/, /\.jsx?$/],
      exclude: [/node_modules/, /\.d\.ts$/],
      
      // Template functions
      cssTemplateFunctions: ['css', 'styled', 'keyframes'],
      
      // JSX processing
      enableJSXTransform: true,
      
      // Advanced options
      replace: true,
      mediaQuery: false
    })
  ]
})
```

## 🎨 Property List Configuration

The `propList` option allows fine-grained control over which CSS properties are converted:

```typescript
propList: [
  '*',           // Convert all properties
  '!font-size',  // Except font-size
  '!border*',    // Except properties starting with 'border'
]
```

### Common Property Patterns

```typescript
// Layout properties only
propList: ['width', 'height', 'padding*', 'margin*']

// Typography excluded
propList: ['*', '!font*', '!line-height', '!letter-spacing']

// Borders excluded
propList: ['*', '!border*', '!outline*']
```

## 🚫 Ignoring Specific Lines

Use comments to skip conversion for specific lines or blocks:

```typescript
const useStyles = createStyles(({ css }) => ({
  container: css`
    width: 320px;  /* This will be converted to rem */
    
    /* antd-style-px-to-rem ignore */
    height: 240px; /* This will NOT be converted */
    
    padding: 16px; /* This will be converted to rem */
    
    /* antd-style-px-to-rem ignore */
    border: 1px solid #ccc; /* This line will be ignored */
    
    margin: 8px;   /* This will be converted to rem */
  `
}))
```

## 📁 File Structure

The plugin is organized into modular components:

```
vite-plugin-antd-style-px-to-rem/
├── types.ts           # TypeScript type definitions
├── constants.ts       # Default options and constants
├── utils.ts          # Utility functions
├── css-processor.ts  # CSS processing logic
├── jsx-processor.ts  # JSX processing logic
├── ast-processor.ts  # AST processing logic
├── index.ts          # Main plugin entry
└── __tests__/        # Test files
```

## 🔧 API Reference

### Main Export

```typescript
import { antdStylePxToRem } from 'vite-plugin-antd-style-px-to-rem'
```

### Type Exports

```typescript
import type { 
  AntdStylePxToRemOptions,
  ProcessOptions 
} from 'vite-plugin-antd-style-px-to-rem'
```

### Constants Export

```typescript
import { defaultOptions } from 'vite-plugin-antd-style-px-to-rem'
```

## 🏗️ Integration Examples

### With React + TypeScript

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { antdStylePxToRem } from 'vite-plugin-antd-style-px-to-rem'

export default defineConfig({
  plugins: [
    react(),
    antdStylePxToRem({
      rootValue: 16,
      propList: ['*', '!border*'],
      include: [/\.tsx?$/],
      cssTemplateFunctions: ['css', 'keyframes']
    })
  ]
})
```

### With Next.js

```typescript
// next.config.js
const { antdStylePxToRem } = require('vite-plugin-antd-style-px-to-rem')

module.exports = {
  experimental: {
    // Configure for Next.js if needed
  },
  webpack: (config) => {
    // Additional webpack configuration
    return config
  }
}
```

### Mobile-First Design

```typescript
// Perfect for mobile applications
antdStylePxToRem({
  rootValue: 16,        // Base font size
  unitPrecision: 3,     // Smaller precision for mobile
  minPixelValue: 0.5,   // Convert very small values
  propList: ['*'],      // Convert all properties
  enableJSXTransform: true
})
```

## 🔍 Debugging

### Enable Detailed Logging

The plugin includes built-in error handling and warnings:

```typescript
// Check browser console for conversion warnings
console.warn("Failed to process CSS template with px to rem conversion:", error)
```

### Common Issues

1. **Plugin not processing files**: Check `include`/`exclude` patterns
2. **Conversions not working**: Verify `propList` configuration
3. **Build errors**: Ensure TypeScript types are properly imported

## 📝 Best Practices

### 1. Root Value Selection

Choose your root value based on your design system:

```typescript
// For 16px base font size (common)
rootValue: 16  // 1rem = 16px

// For 14px base font size
rootValue: 14  // 1rem = 14px

// For 10px base font size (easy calculations)
rootValue: 10  // 1rem = 10px
```

### 2. Property List Strategy

Be selective about which properties to convert:

```typescript
// Recommended: Convert layout properties, keep typography as-is
propList: [
  'width', 'height', 'min-width', 'max-width',
  'min-height', 'max-height', 'padding*', 'margin*',
  'top', 'right', 'bottom', 'left',
  '!font*', '!line-height'
]
```

### 3. Performance Optimization

```typescript
// Exclude unnecessary files for better performance
exclude: [
  /node_modules/,
  /\.d\.ts$/,
  /\.min\./,
  /vendor/
]
```

## 🧪 Testing

The plugin includes comprehensive tests. Run them with:

```bash
npm test
```

### Test Coverage

- ✅ Basic px to rem conversion
- ✅ CSS template literal processing
- ✅ createStyles function handling
- ✅ JSX attribute transformation
- ✅ Ignore comment functionality
- ✅ Error handling and edge cases
- ✅ Configuration option validation

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Development Setup

```bash
# Clone the repository
git clone https://github.com/your-username/vite-plugin-antd-style-px-to-rem.git

# Install dependencies
npm install

# Run tests
npm test

# Build the plugin
npm run build
```

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [postcss-pxtorem](https://github.com/cuth/postcss-pxtorem)
- Built for the [antd-style](https://github.com/ant-design/antd-style) ecosystem
- Powered by [Babel](https://babeljs.io/) for AST processing

## 📧 Support

If you have any questions or need help, please:

1. Check the [documentation](#-quick-start)
2. Search [existing issues](https://github.com/your-username/vite-plugin-antd-style-px-to-rem/issues)
3. Create a [new issue](https://github.com/your-username/vite-plugin-antd-style-px-to-rem/issues/new)

---

Made with ❤️ for the React and antd-style community 