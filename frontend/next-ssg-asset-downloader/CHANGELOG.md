# Changelog

## [2.0.0] - 2024-01-XX

### 🚀 重大重构：HTML扫描模式

#### Breaking Changes
- **完全重构**：从API/Sitemap/爬虫模式改为HTML文件扫描模式
- **配置变更**：移除`autoDiscovery`配置，新增`baseUrl`、`htmlDir`、`assetPathPrefix`等配置
- **工作流程变更**：现在在Next.js构建完成后扫描HTML文件，而非预构建时发现资源

#### Added
- 🔍 **智能HTML扫描**：自动分析生成的HTML文件中的资源引用
- 🎯 **路径前缀过滤**：只下载指定路径前缀的资源（如`/uploads/`）
- 📁 **递归目录扫描**：支持递归扫描HTML文件目录
- 🎨 **多元素支持**：支持img、video、audio、source、link等HTML元素
- 📊 **CSS资源提取**：支持从CSS文件中提取url()引用的资源

#### Enhanced
- ⚡ **更精确的资源定位**：基于实际HTML内容而非API猜测
- 🛠️ **更简单的配置**：减少复杂的发现模式配置
- 📝 **更清晰的工作流程**：构建后扫描，符合SSG的实际需求

#### Technical
- 新增`scanHtmlForAssets`方法替代旧的自动发现功能
- 新增`getHtmlFiles`、`extractAssetsFromHtml`、`isValidAssetUrl`等核心方法
- 移除旧的`discoverAssets`、`discoverFromApi`、`discoverFromSitemap`等方法
- 更新配置接口`AssetDownloaderConfig`

## [1.1.0] - 2024-01-XX

### Added
- 🔍 **自动发现功能**：支持API、Sitemap、网页爬虫三种模式自动发现资源
- 🎯 **智能过滤系统**：支持文件扩展名和路径模式过滤
- 📊 **详细报告**：提供发现和下载的详细统计信息
- 🛠️ **灵活配置**：支持多种发现模式和自定义过滤规则
- 📖 **完整文档**：新增AUTO-DISCOVERY.md详细说明文档

### Enhanced
- ⚡ **性能优化**：改进并发下载和错误处理机制
- 🔧 **配置扩展**：新增autoDiscovery配置选项
- 📝 **示例更新**：更新配置示例和使用说明

### Technical
- 新增`discoverAssets`方法支持自动资源发现
- 新增`extractBaseUrls`、`discoverFromApi`、`discoverFromSitemap`、`discoverFromCrawl`等核心方法
- 新增`isAssetUrl`、`isSameDomain`、`filterDiscoveredUrls`等辅助方法
- 完善错误处理和日志输出

### 计划中的功能
- 支持断点续传
- 支持文件完整性验证
- 支持进度回调
- 支持自定义重试策略

## [1.0.0] - 2024-01-XX

### 新增
- 🎉 初始版本发布
- ✨ 支持在 Next.js SSG 构建时自动下载远程资源
- 🚀 支持并发下载控制（默认5个并发）
- ⏱️ 支持下载超时设置（默认30秒）
- 📁 支持自定义下载目录
- 🏷️ 支持自定义文件名映射
- 🛠️ 支持开发环境跳过下载
- 📊 提供详细的下载结果报告
- 🔧 完整的 TypeScript 类型支持
- 📚 提供完整的使用文档和示例

### 技术特性
- 基于 webpack hooks 实现，与 Next.js 构建流程深度集成
- 使用 node-fetch 进行 HTTP 请求
- 使用 fs-extra 进行文件操作
- 支持 AbortController 进行请求取消
- 错误处理和重试机制
- 内存优化的分批下载

### 文档
- README.md - 完整的使用指南
- USAGE.md - 针对 han-studies 项目的使用说明
- 示例配置文件
- TypeScript 类型定义
- 基础功能测试

### 依赖
- Next.js >= 12.0.0 (peerDependency)
- fs-extra ^11.2.0
- node-fetch ^3.3.2
- TypeScript ^5.0.0 (devDependency)

---

## 版本说明

- **主版本号**：当你做了不兼容的 API 修改
- **次版本号**：当你做了向下兼容的功能性新增
- **修订号**：当你做了向下兼容的问题修正

## 贡献指南

如果你想为此项目做出贡献，请：

1. Fork 此仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 许可证

此项目使用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。