# 自动发现功能使用指南

## 概述

自动发现功能允许插件在构建时自动发现并下载指定服务器上的所有资源文件，无需手动指定每个资源的URL。这对于从CMS系统（如Strapi）或其他动态内容源下载资源特别有用。

## 功能特性

- 🔍 **多种发现模式**：API、Sitemap、网页爬虫
- 🎯 **智能过滤**：支持文件扩展名和路径模式过滤
- 🚀 **高效下载**：与现有的并发控制和超时机制集成
- 🔧 **灵活配置**：支持自定义API端点和爬取深度
- 📊 **详细报告**：提供发现和下载的详细日志

## 配置选项

### 基础配置

```javascript
const { withAssetDownloader } = require('next-ssg-asset-downloader');

module.exports = withAssetDownloader({
  urls: ['http://localhost:1337/'], // 基础URL，插件会从这里提取域名
  outputDir: 'public/uploads',
  
  autoDiscovery: {
    enabled: true,                    // 启用自动发现
    mode: 'api',                     // 发现模式：'api' | 'sitemap' | 'crawl'
    apiEndpoint: '/api/upload/files', // API端点（仅API模式）
    includeExtensions: [             // 包含的文件扩展名
      '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
      '.mp4', '.mp3', '.pdf', '.zip'
    ],
    excludePatterns: [               // 排除的路径模式
      'thumbnail_', 'temp_', 'cache_'
    ],
    maxDepth: 2                      // 最大爬取深度（仅爬虫模式）
  }
});
```

### 发现模式详解

#### 1. API模式（推荐）

适用于有API端点的系统，如Strapi CMS：

```javascript
autoDiscovery: {
  enabled: true,
  mode: 'api',
  apiEndpoint: '/api/upload/files', // Strapi的文件API
  // 其他配置...
}
```

**支持的API响应格式：**

```javascript
// 格式1：直接数组
[
  "http://localhost:1337/uploads/image1.jpg",
  "http://localhost:1337/uploads/document.pdf"
]

// 格式2：包含data字段
{
  "data": [
    {
      "url": "http://localhost:1337/uploads/image1.jpg",
      "name": "image1.jpg"
    }
  ]
}

// 格式3：Strapi格式
{
  "data": [
    {
      "attributes": {
        "url": "/uploads/image1.jpg",
        "name": "image1.jpg"
      }
    }
  ]
}
```

#### 2. Sitemap模式

适用于有sitemap.xml的网站：

```javascript
autoDiscovery: {
  enabled: true,
  mode: 'sitemap',
  // 会自动查找 /sitemap.xml 和 /sitemap_index.xml
}
```

#### 3. 爬虫模式

通过爬取网页发现资源：

```javascript
autoDiscovery: {
  enabled: true,
  mode: 'crawl',
  maxDepth: 2, // 爬取深度，建议不超过3
}
```

## 使用场景

### 场景1：Strapi CMS集成

```javascript
// next.config.js
const { withAssetDownloader } = require('next-ssg-asset-downloader');

module.exports = withAssetDownloader({
  urls: ['http://localhost:1337/'],
  outputDir: 'public/uploads',
  
  autoDiscovery: {
    enabled: true,
    mode: 'api',
    apiEndpoint: '/api/upload/files',
    includeExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
    excludePatterns: ['thumbnail_']
  },
  
  // 移除Strapi的随机后缀
  fileNameMapper: (url, index) => {
    const urlObj = new URL(url);
    let fileName = decodeURIComponent(urlObj.pathname.split('/').pop() || `asset-${index}`);
    return fileName.replace(/_[a-f0-9]{6,}(\.[^.]+)$/, '$1');
  },
  
  skipInDevelopment: true
});
```

### 场景2：静态网站资源收集

```javascript
module.exports = withAssetDownloader({
  urls: ['https://example.com/'],
  outputDir: 'public/assets',
  
  autoDiscovery: {
    enabled: true,
    mode: 'crawl',
    maxDepth: 1,
    includeExtensions: ['.jpg', '.png', '.pdf'],
    excludePatterns: ['ads/', 'temp/']
  }
});
```

### 场景3：多源资源聚合

```javascript
module.exports = withAssetDownloader({
  urls: [
    'http://localhost:1337/',  // Strapi CMS
    'https://cdn.example.com/', // CDN
    'https://api.example.com/'  // API服务
  ],
  outputDir: 'public/assets',
  
  autoDiscovery: {
    enabled: true,
    mode: 'api',
    apiEndpoint: '/api/assets',
    includeExtensions: ['.jpg', '.png', '.mp4', '.pdf']
  }
});
```

## 工作流程

1. **URL提取**：从配置的`urls`数组中提取基础域名
2. **资源发现**：根据`mode`调用相应的发现方法
3. **URL过滤**：应用扩展名和路径模式过滤
4. **去重合并**：与手动配置的URLs合并并去重
5. **批量下载**：使用现有的下载机制进行并发下载

## 前端代理兼容性

如果您的前端应用通过代理访问后端服务（如`http://localhost:1337/`），自动发现功能不会受到影响：

- **构建时**：插件直接访问后端服务进行资源发现和下载
- **运行时**：前端继续使用代理配置访问API
- **部署时**：所有资源已下载到静态文件夹，无需后端服务

## 错误处理

插件会优雅地处理各种错误情况：

```javascript
// 服务器不可用
[AssetDownloader] Failed to discover assets from http://localhost:1337/: fetch failed

// API端点不存在
[AssetDownloader] API discovery failed for http://localhost:1337/api/upload/files: API responded with status 404

// 无效的URL格式
[AssetDownloader] Invalid URL: invalid-url
```

## 性能优化建议

1. **合理设置并发数**：根据服务器性能调整`concurrency`
2. **精确过滤规则**：使用`includeExtensions`和`excludePatterns`减少不必要的下载
3. **限制爬取深度**：爬虫模式下设置合理的`maxDepth`
4. **开发环境跳过**：设置`skipInDevelopment: true`提高开发效率

## 调试技巧

1. **启用详细日志**：查看控制台输出了解发现过程
2. **测试API端点**：手动访问API确保返回正确格式
3. **检查网络连接**：确保构建环境能访问目标服务器
4. **验证过滤规则**：检查`includeExtensions`和`excludePatterns`配置

## 常见问题

### Q: 为什么没有发现任何资源？
A: 检查以下几点：
- 服务器是否正在运行
- API端点是否正确
- 过滤规则是否过于严格
- 网络连接是否正常

### Q: 如何自定义API响应解析？
A: 插件支持多种常见格式，如需特殊格式支持，可以提交Issue或PR。

### Q: 爬虫模式会影响服务器性能吗？
A: 插件使用合理的延迟和并发控制，但建议在非生产环境使用爬虫模式。

### Q: 可以同时使用多种发现模式吗？
A: 目前每次只能使用一种模式，但可以通过多个配置实例实现。

## 示例项目

查看`example/auto-discovery-config.js`获取完整的配置示例。

## 贡献

欢迎提交Issue和Pull Request来改进自动发现功能！