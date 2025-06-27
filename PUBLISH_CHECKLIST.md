# NPM 发布前检查清单

在发布到 NPM 之前，请确保完成以下所有步骤：

## 📋 代码质量检查

- [ ] **代码格式化**: 运行 `npm run format` 确保代码格式一致
- [ ] **代码检查**: 运行 `npm run lint` 并修复所有错误和警告
- [ ] **类型检查**: 运行 `npm run typecheck` 确保没有 TypeScript 错误
- [ ] **测试**: 运行 `npm run test` 确保所有测试通过
- [ ] **测试覆盖率**: 运行 `npm run test:coverage` 检查覆盖率是否满足要求

## 🏗️ 构建验证

- [ ] **本地构建**: 运行 `npm run build` 确保构建成功
- [ ] **构建产物检查**: 检查 `dist/` 目录下的文件是否正确
  - [ ] `dist/index.js` (CommonJS 格式)
  - [ ] `dist/index.mjs` (ES 模块格式)
  - [ ] `dist/index.d.ts` (TypeScript 类型定义)
- [ ] **包大小检查**: 使用 `npm pack --dry-run` 检查包内容和大小

## 📦 包信息验证

- [ ] **package.json 检查**:
  - [ ] 版本号是否正确更新
  - [ ] 描述是否准确
  - [ ] 关键词是否完整
  - [ ] 作者信息是否正确
  - [ ] 仓库 URL 是否正确
  - [ ] 许可证是否正确
  - [ ] 依赖版本是否合适

- [ ] **README 文档**:
  - [ ] 安装说明是否正确
  - [ ] 使用示例是否有效
  - [ ] API 文档是否完整
  - [ ] 版本徽章是否正确

## 🔗 Git 和 GitHub

- [ ] **代码提交**: 所有更改都已提交到 Git
- [ ] **标签创建**: 为发布版本创建 Git 标签
- [ ] **推送到远程**: 代码和标签都已推送到 GitHub
- [ ] **GitHub Release**: 在 GitHub 上创建对应的 Release

## 🧪 发布前测试

- [ ] **本地测试**: 在真实项目中测试插件功能
- [ ] **不同环境测试**: 在不同 Node.js 版本下测试 (16.x, 18.x, 20.x)
- [ ] **CI/CD 检查**: GitHub Actions 工作流全部通过

## 📚 文档更新

- [ ] **CHANGELOG.md**: 更新变更日志
- [ ] **版本文档**: 确保文档版本与包版本一致
- [ ] **示例代码**: 验证 README 中的示例代码可以正常运行

## 🚀 NPM 发布

- [ ] **NPM 账户**: 确保已登录正确的 NPM 账户 (`npm whoami`)
- [ ] **发布权限**: 确保有发布该包的权限
- [ ] **预发布检查**: 运行 `npm run prepublishOnly` 进行最终检查
- [ ] **发布**: 运行 `npm publish` 或 `npm run release`

## ✅ 发布后验证

- [ ] **NPM 包页面**: 检查 npmjs.com 上的包页面显示正常
- [ ] **安装测试**: 在新项目中安装并测试包功能
- [ ] **文档链接**: 确保所有文档链接指向正确的版本
- [ ] **GitHub Release**: 确保 GitHub Release 页面信息完整

## 🔧 可选步骤

- [ ] **社交媒体**: 在社交媒体上宣布新版本发布
- [ ] **社区通知**: 在相关社区或论坛中分享
- [ ] **博客文章**: 撰写发布说明或使用指南

---

## 快速命令列表

```bash
# 代码质量检查
npm run format
npm run lint
npm run typecheck
npm run test
npm run test:coverage

# 构建和发布
npm run build
npm pack --dry-run
npm run prepublishOnly
npm publish

# Git 操作
git add .
git commit -m "chore: prepare for v1.0.0 release"
git tag v1.0.0
git push origin main --tags
``` 