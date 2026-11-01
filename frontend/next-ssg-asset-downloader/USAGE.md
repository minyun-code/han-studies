# Next.js SSG 资源下载器使用指南

## 在 han-studies 项目中使用

这个插件专为 Next.js 静态站点生成(SSG)设计，可以在构建时自动下载后端 URL 资源到前端文件夹。以下是在 han-studies 项目中使用此插件的步骤。

### 安装插件

1. 在项目根目录下安装本地开发的插件：

```bash
npm install ./next-ssg-asset-downloader
```

或者，如果插件已发布到 npm：

```bash
npm install next-ssg-asset-downloader
```

### 配置 Next.js

2. 修改 `next.config.js` 文件，添加插件配置：

```javascript
const { withAssetDownloader } = require('next-ssg-asset-downloader');

// 你现有的 Next.js 配置
const nextConfig = {
  output: 'export',
  // ... 其他配置
};

// 资源下载配置
const assetConfig = {
  // 要下载的资源URL列表
  urls: [
    'http://127.0.0.1:1337/uploads/slider_1.jpg',
    'http://127.0.0.1:1337/uploads/slider_2.jpg',
    // ... 其他资源URL
  ],

  // 下载到public/uploads目录
  outputDir: 'public/uploads',

  // 其他可选配置
  concurrency: 3,
  timeout: 30000,
  skipInDevelopment: true
};

// 导出增强的配置
module.exports = withAssetDownloader(assetConfig)(nextConfig);
```

### 动态获取资源 URL

3. 如果你需要动态获取资源 URL（例如从 Strapi CMS），可以使用以下方式：

```javascript
const { withAssetDownloader } = require('next-ssg-asset-downloader');
const fetch = require('node-fetch');

// 基础 Next.js 配置
const nextConfig = {
  output: 'export',
  // ... 其他配置
};

// 异步函数获取资源 URL
async function getAssetUrls() {
  try {
    const response = await fetch('http://127.0.0.1:1337/api/assets');
    const data = await response.json();
    return data.map(item => `http://127.0.0.1:1337${item.url}`);
  } catch (error) {
    console.error('获取资源URL失败:', error);
    return [];
  }
}

// 导出配置函数
module.exports = async () => {
  const assetUrls = await getAssetUrls();

  const assetConfig = {
    urls: assetUrls,
    outputDir: 'public/uploads',
    // ... 其他配置
  };

  return withAssetDownloader(assetConfig)(nextConfig);
};
```

### 构建项目

4. 运行构建命令：

```bash
npm run build
```

插件会在构建过程中自动下载所有指定的资源到 `public/uploads` 目录。

### 验证下载

5. 构建完成后，检查 `public/uploads` 目录，确认所有资源是否已成功下载。

### 部署静态站点

6. 部署生成的静态站点（位于 `out` 目录）：

```bash
npm run export
```

现在，你的静态站点包含了所有必要的资源文件，可以独立部署，无需依赖后端服务。

## 常见问题

### 资源路径问题

确保你的前端代码中引用资源的路径与下载后的路径一致。例如，如果你的资源下载到 `public/uploads` 目录，那么在前端代码中应该使用 `/uploads/image.jpg` 路径。

### 开发环境与生产环境

- **开发环境**：插件默认在开发环境中跳过下载（`skipInDevelopment: true`），你可以使用 Next.js 的 `rewrites` 功能代理请求到后端服务。
- **生产环境**：插件会下载所有资源，并且不需要 `rewrites` 配置。

### 大文件处理

如果需要下载大文件，建议：

1. 增加 `timeout` 值（例如 60000 毫秒）
2. 减少 `concurrency` 值（例如 2）
3. 考虑将大文件分开处理

## 自定义文件名

如果你需要自定义下载文件的名称，可以使用 `fileNameMapper` 函数：

```javascript
const assetConfig = {
  urls: [...],
  outputDir: 'public/uploads',
  fileNameMapper: (url, index) => {
    const urlObj = new URL(url);
    const originalFileName = urlObj.pathname.split('/').pop();

    // 例如：添加前缀或修改文件名
    return `downloaded-${originalFileName}`;
  }
};
```

## 完整示例

请参考项目中的 `demo-config.js` 文件，其中包含了针对 han-studies 项目的完整配置示例。