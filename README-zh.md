# vite-plugin-antd-style-px-to-rem

[![npm version](https://badge.fury.io/js/vite-plugin-antd-style-px-to-rem.svg)](https://badge.fury.io/js/vite-plugin-antd-style-px-to-rem)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

一个 Vite 插件，能够在构建时自动将 antd-style CSS 模板字面量、`createStyles` 函数和 JSX 属性中的 `px` 值转换为 `rem` 单位。该插件通过使像素值相对于根字体大小来帮助创建响应式设计。

## ✨ 特性

- 🎯 **智能检测**: 自动检测并处理 antd-style CSS 模板
- 🔧 **灵活配置**: 高度可定制，提供丰富的配置选项
- 🎨 **多目标支持**: 支持 CSS 模板、`createStyles` 函数和 JSX 属性
- 🚫 **忽略注释**: 使用 `/* antd-style-px-to-rem ignore */` 注释跳过转换
- 📱 **响应式就绪**: 非常适合构建响应式 Web 应用程序
- ⚡ **快速处理**: 为开发和构建性能进行了优化
- 🔍 **TypeScript 支持**: 完整的 TypeScript 支持，包含类型定义

## 📦 安装

```bash
# npm
npm install vite-plugin-antd-style-px-to-rem --save-dev

# yarn
yarn add vite-plugin-antd-style-px-to-rem --dev

# pnpm
pnpm add vite-plugin-antd-style-px-to-rem --save-dev
```

## 🚀 快速开始

### 基础设置

在您的 `vite.config.ts` 中添加插件：

```typescript
import { defineConfig } from 'vite'
import { antdStylePxToRem } from 'vite-plugin-antd-style-px-to-rem'

export default defineConfig({
  plugins: [
    antdStylePxToRem({
      rootValue: 16,        // 1rem = 16px
      unitPrecision: 5,     // rem 值的精度
      propList: ['*'],      // 要转换的属性
      minPixelValue: 1,     // 最小要转换的 px 值
    })
  ]
})
```

### 使用示例

插件会自动处理各种 antd-style 模式：

#### CSS 模板字面量

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

#### createStyles 函数

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

#### JSX 属性（可选）

```jsx
// 当 enableJSXTransform 为 true 时
<div style={{ width: 320, height: 240 }}>
  {/* → style={{ width: '20rem', height: '15rem' }} */}
</div>

<Flex gap={16}>
  {/* → <Flex gap="1rem"> */}
</Flex>
```

## ⚙️ 配置选项

### AntdStylePxToRemOptions

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `rootValue` | `number` | `16` | 根字体大小（1rem = rootValue px） |
| `unitPrecision` | `number` | `5` | rem 值的小数精度 |
| `minPixelValue` | `number` | `0` | 转换的最小像素值 |
| `propList` | `string[]` | `['*']` | 要转换的 CSS 属性 |
| `selectorBlackList` | `(string \| RegExp)[]` | `[]` | 要忽略的选择器（未来使用） |
| `replace` | `boolean` | `true` | 替换原始值或在旁边添加 |
| `mediaQuery` | `boolean` | `false` | 转换媒体查询中的 px |
| `include` | `string \| RegExp \| (string \| RegExp)[]` | `undefined` | 要包含的文件 |
| `exclude` | `string \| RegExp \| (string \| RegExp)[]` | `undefined` | 要排除的文件 |
| `cssTemplateFunctions` | `string[]` | `['css']` | 要处理的 CSS 模板函数名称 |
| `enableJSXTransform` | `boolean` | `true` | 启用 JSX 属性转换 |

### 高级配置

```typescript
export default defineConfig({
  plugins: [
    antdStylePxToRem({
      // 基础设置
      rootValue: 16,
      unitPrecision: 5,
      minPixelValue: 1,
      
      // 属性过滤
      propList: [
        '*',                    // 转换所有属性
        '!border*',            // 除了 border 属性
        '!outline*'            // 除了 outline 属性
      ],
      
      // 文件过滤
      include: [/\.tsx?$/, /\.jsx?$/],
      exclude: [/node_modules/, /\.d\.ts$/],
      
      // 模板函数
      cssTemplateFunctions: ['css', 'styled', 'keyframes'],
      
      // JSX 处理
      enableJSXTransform: true,
      
      // 高级选项
      replace: true,
      mediaQuery: false
    })
  ]
})
```

## 🎨 属性列表配置

`propList` 选项允许精细控制哪些 CSS 属性要被转换：

```typescript
propList: [
  '*',           // 转换所有属性
  '!font-size',  // 除了 font-size
  '!border*',    // 除了以 'border' 开头的属性
]
```

### 常用属性模式

```typescript
// 仅布局属性
propList: ['width', 'height', 'padding*', 'margin*']

// 排除字体相关
propList: ['*', '!font*', '!line-height', '!letter-spacing']

// 排除边框相关
propList: ['*', '!border*', '!outline*']
```

## 🚫 忽略特定行

使用注释来跳过特定行或块的转换：

```typescript
const useStyles = createStyles(({ css }) => ({
  container: css`
    width: 320px;  /* 这行会被转换为 rem */
    
    /* antd-style-px-to-rem ignore */
    height: 240px; /* 这行不会被转换 */
    
    padding: 16px; /* 这行会被转换为 rem */
    
    /* antd-style-px-to-rem ignore */
    border: 1px solid #ccc; /* 这行会被忽略 */
    
    margin: 8px;   /* 这行会被转换为 rem */
  `
}))
```

## 📁 文件结构

插件采用模块化组件架构：

```
vite-plugin-antd-style-px-to-rem/
├── types.ts           # TypeScript 类型定义
├── constants.ts       # 默认选项和常量
├── utils.ts          # 工具函数
├── processors/       # 处理器模块
│   ├── css-processor.ts  # CSS 处理逻辑
│   ├── jsx-processor.ts  # JSX 处理逻辑
│   └── ast-processor.ts  # AST 处理逻辑
├── index.ts          # 主插件入口
└── __tests__/        # 测试文件
```

## 🔧 API 参考

### 主要导出

```typescript
import { antdStylePxToRem } from 'vite-plugin-antd-style-px-to-rem'
```

### 类型导出

```typescript
import type { 
  AntdStylePxToRemOptions,
  ProcessOptions 
} from 'vite-plugin-antd-style-px-to-rem'
```

### 常量导出

```typescript
import { defaultOptions } from 'vite-plugin-antd-style-px-to-rem'
```

## 🏗️ 集成示例

### 与 React + TypeScript

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

### 与 Next.js

```typescript
// next.config.js
const { antdStylePxToRem } = require('vite-plugin-antd-style-px-to-rem')

module.exports = {
  experimental: {
    // 如果需要，为 Next.js 配置
  },
  webpack: (config) => {
    // 额外的 webpack 配置
    return config
  }
}
```

### 移动端优先设计

```typescript
// 非常适合移动应用
antdStylePxToRem({
  rootValue: 16,        // 基础字体大小
  unitPrecision: 3,     // 移动端较小的精度
  minPixelValue: 0.5,   // 转换非常小的值
  propList: ['*'],      // 转换所有属性
  enableJSXTransform: true
})
```

## 🔍 调试

### 启用详细日志

插件包含内置的错误处理和警告：

```typescript
// 检查浏览器控制台中的转换警告
console.warn("Failed to process CSS template with px to rem conversion:", error)
```

### 常见问题

1. **插件不处理文件**: 检查 `include`/`exclude` 模式
2. **转换不起作用**: 验证 `propList` 配置
3. **构建错误**: 确保正确导入 TypeScript 类型

## 📝 最佳实践

### 1. 根值选择

根据您的设计系统选择根值：

```typescript
// 16px 基础字体大小（常见）
rootValue: 16  // 1rem = 16px

// 14px 基础字体大小
rootValue: 14  // 1rem = 14px

// 10px 基础字体大小（便于计算）
rootValue: 10  // 1rem = 10px
```

### 2. 属性列表策略

对要转换的属性进行选择：

```typescript
// 推荐：转换布局属性，保持排版不变
propList: [
  'width', 'height', 'min-width', 'max-width',
  'min-height', 'max-height', 'padding*', 'margin*',
  'top', 'right', 'bottom', 'left',
  '!font*', '!line-height'
]
```

### 3. 性能优化

```typescript
// 排除不必要的文件以获得更好的性能
exclude: [
  /node_modules/,
  /\.d\.ts$/,
  /\.min\./,
  /vendor/
]
```

## 🧪 测试

插件包含全面的测试。运行测试：

```bash
npm test
```

### 测试覆盖率

- ✅ 基础 px 到 rem 转换
- ✅ CSS 模板字面量处理
- ✅ createStyles 函数处理
- ✅ JSX 属性转换
- ✅ 忽略注释功能
- ✅ 错误处理和边缘情况
- ✅ 配置选项验证

## 🤝 贡献

欢迎贡献！请阅读我们的贡献指南：

1. Fork 仓库
2. 创建功能分支
3. 进行更改
4. 为新功能添加测试
5. 确保所有测试通过
6. 提交 pull request

### 开发设置

```bash
# 克隆仓库
git clone https://github.com/your-username/vite-plugin-antd-style-px-to-rem.git

# 安装依赖
npm install

# 运行测试
npm test

# 构建插件
npm run build
```

## 📄 许可证

MIT 许可证 - 详情请查看 [LICENSE](LICENSE) 文件。

## 🙏 致谢

- 灵感来自 [postcss-pxtorem](https://github.com/cuth/postcss-pxtorem)
- 为 [antd-style](https://github.com/ant-design/antd-style) 生态系统构建
- 由 [Babel](https://babeljs.io/) 提供 AST 处理支持

## 📧 支持

如果您有任何问题或需要帮助，请：

1. 查看[文档](#-快速开始)
2. 搜索[现有问题](https://github.com/your-username/vite-plugin-antd-style-px-to-rem/issues)
3. 创建[新问题](https://github.com/your-username/vite-plugin-antd-style-px-to-rem/issues/new)

---

为 React 和 antd-style 社区用 ❤️ 制作 