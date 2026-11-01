# Next.js SSG Asset Downloader

一个用于Next.js静态站点生成(SSG)的插件，在构建完成后扫描HTML文件，自动下载其中引用的远程资源到本地。

## 功能特性

- 🚀 在Next.js SSG构建完成后自动下载远程资源
- 🔍 **智能HTML扫描**：自动分析生成的HTML文件中的资源引用
- 📁 支持自定义下载目录和HTML扫描目录
- 🎯 **路径前缀过滤**：只下载指定路径前缀的资源
- 🔄 支持并发下载控制
- 📝 支持自定义文件名映射
- ⏱️ 支持下载超时控制
- 🛠️ 开发环境可选跳过下载
- 🎨 智能过滤：支持文件扩展名和路径模式过滤
- 📊 详细的下载结果报告

## 安装

```bash
npm install next-ssg-asset-downloader
# 或
yarn add next-ssg-asset-downloader
# 或
pnpm add next-ssg-asset-downloader
```

## 使用方法

### 基础用法

在你的 `next.config.js` 文件中：

```javascript
const { withAssetDownloader } = require('next-ssg-asset-downloader');

const nextConfig = {
  // 你的其他Next.js配置
  output: 'export', // 确保启用SSG
};

// 配置资源下载
const assetConfig = {
  baseUrl: 'https://api.example.com', // 远程资源的基础URL
  outputDir: 'public/downloads', // 下载到 public/downloads 目录
  htmlDir: 'out', // Next.js export 输出目录
  assetPathPrefix: '/uploads/', // 只下载以此路径开头的资源
  includeExtensions: ['.jpg', '.png', '.pdf'], // 包含的文件类型
  excludePatterns: ['temp_*'] // 排除的文件模式
};

module.exports = withAssetDownloader(assetConfig)(nextConfig);
```

### TypeScript 用法

在你的 `next.config.ts` 文件中：

```typescript
import { withAssetDownloader, AssetDownloaderConfig } from 'next-ssg-asset-downloader';
import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
};

const assetConfig: AssetDownloaderConfig = {
  urls: [
    'https://api.example.com/uploads/image1.jpg',
    'https://api.example.com/uploads/image2.png'
  ],
  outputDir: 'public/assets',
  concurrency: 3,
  timeout: 15000
};

export default withAssetDownloader(assetConfig)(nextConfig);
```

### HTML扫描功能

插件会在Next.js构建完成后自动扫描生成的HTML文件，提取其中的资源引用并下载：

#### 工作流程

1. **构建阶段**：Next.js生成静态HTML文件到指定目录（通常是`out`）
2. **扫描阶段**：插件递归扫描HTML文件，提取资源URL
3. **过滤阶段**：根据配置的路径前缀和文件类型过滤资源
4. **下载阶段**：并发下载符合条件的资源到本地目录

#### 配置示例

```javascript
const assetConfig = {
  baseUrl: 'https://cms.example.com', // 远程资源基础URL
  outputDir: 'public/uploads', // 本地下载目录
  htmlDir: 'out', // HTML文件扫描目录
  assetPathPrefix: '/uploads/', // 只下载此路径前缀的资源
  recursive: true, // 递归扫描子目录
  includeExtensions: ['.jpg', '.png', '.pdf'], // 包含的文件类型
  excludePatterns: ['thumbnail_*', 'temp/*'] // 排除的文件模式
};
```

#### 支持的HTML元素

插件会自动识别以下HTML元素中的资源引用：
- `<img src="...">`
- `<video src="...">`
- `<audio src="...">`
- `<source src="...">`
- `<link href="...">` （CSS、图标等）
- CSS中的`url()`引用

## 配置选项

### AssetDownloaderConfig

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `urls` | `string[]` | `[]` | 要下载的资源URL列表（可选，用于手动指定） |
| `baseUrl` | `string` | **必需** | 远程资源的基础URL |
| `outputDir` | `string` | `'public/downloads'` | 下载文件的输出目录 |
| `htmlDir` | `string` | `'out'` | HTML文件扫描目录 |
| `assetPathPrefix` | `string` | `''` | 资源路径前缀过滤器 |
| `recursive` | `boolean` | `true` | 是否递归扫描子目录 |
| `concurrency` | `number` | `5` | 并发下载数量 |
| `timeout` | `number` | `10000` | 下载超时时间（毫秒） |
| `skipInDevelopment` | `boolean` | `false` | 开发环境是否跳过下载 |
| `fileNameMapper` | `function` | `undefined` | 自定义文件名映射函数 |
| `includeExtensions` | `string[]` | `[]` | 包含的文件扩展名（空数组表示全部） |
| `excludePatterns` | `string[]` | `[]` | 排除的文件名模式 |

### 自定义文件名映射

```javascript
const assetConfig = {
  urls: ['https://api.example.com/uploads/image.jpg'],
  outputDir: 'public/assets',
  fileNameMapper: (url, index) => {
    // 自定义文件名逻辑
    const urlObj = new URL(url);
    const originalName = path.basename(urlObj.pathname);
    return `downloaded-${index}-${originalName}`;
  }
};
```

## 高级用法

### 动态URL生成

```javascript
// 从API获取URL列表
async function getAssetUrls() {
  const response = await fetch('https://api.example.com/assets');
  const data = await response.json();
  return data.assets.map(asset => asset.url);
}

const assetConfig = {
  urls: await getAssetUrls(),
  outputDir: 'public/dynamic-assets'
};
```

### 条件下载

```javascript
const assetConfig = {
  urls: process.env.NODE_ENV === 'production'
    ? productionUrls
    : developmentUrls,
  outputDir: 'public/assets',
  skipInDevelopment: false // 开发环境也下载
};
```

## 工作原理

1. **构建时触发**: 插件在Next.js SSG构建过程中的webpack编译阶段触发
2. **并发下载**: 根据配置的并发数量分批下载资源
3. **文件保存**: 将下载的资源保存到指定的前端目录
4. **错误处理**: 提供详细的下载结果报告，包括成功和失败的资源

## 注意事项

- 确保你的Next.js项目配置了 `output: 'export'` 以启用SSG
- 下载的文件会保存在指定的目录中，确保该目录在部署时被包含
- 大文件下载可能会增加构建时间，建议合理设置超时时间
- 在生产环境构建时，确保网络连接稳定

## 错误处理

插件会自动处理以下错误情况：
- 网络连接失败
- HTTP错误状态码
- 下载超时
- 文件写入失败

所有错误都会在控制台中详细记录，但不会中断整个构建过程。

## 许可证

MIT

## 更新日志

### 0.0.1
- 初始版本发布
- 支持基础的资源下载功能
- 支持并发控制和超时设置
- 支持自定义文件名映射