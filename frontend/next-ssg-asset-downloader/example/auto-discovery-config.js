const { withAssetDownloader } = require('next-ssg-asset-downloader');

const nextConfig = {
  output: 'export', // 确保启用SSG
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};

// HTML扫描模式配置示例
const assetConfig = {
  baseUrl: 'http://localhost:1337', // 远程资源的基础URL
  outputDir: 'public/uploads', // 下载到 public/uploads 目录
  htmlDir: 'out', // Next.js export 输出目录
  assetPathPrefix: '/uploads/', // 只下载以此路径开头的资源
  includeExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.mp4', '.mp3', '.pdf'],
  excludePatterns: ['thumbnail_*', 'temp/*'], // 排除缩略图和临时文件
  recursive: true, // 递归扫描子目录
  concurrency: 3, // 并发下载数量
  timeout: 30000,
  skipInDevelopment: true
};

module.exports = withAssetDownloader(assetConfig)(nextConfig);

// 使用说明：
// 1. 首先运行 `next build` 生成静态文件到 'out' 目录
// 2. 插件会自动扫描 'out' 目录中的所有 HTML 文件
// 3. 提取其中引用的资源路径（如 img src、video src 等）
// 4. 从 baseUrl 下载这些资源到 outputDir
// 5. 只下载路径包含 assetPathPrefix 的资源

/**
 * 使用说明：
 *
 * 1. API模式（推荐）：
 *    - 适用于有API端点的CMS系统（如Strapi）
 *    - 需要确保API端点返回资源列表
 *    - 支持多种数据结构格式
 *
 * 2. Sitemap模式：
 *    - 适用于有sitemap.xml的网站
 *    - 会自动查找 /sitemap.xml 和 /sitemap_index.xml
 *
 * 3. Crawl模式：
 *    - 通过爬取网页发现资源
 *    - 适用于没有API的静态网站
 *    - 注意设置合理的maxDepth避免过度爬取
 *
 * 前端代理配置：
 * 如果前端通过代理请求 http://localhost:1337/，
 * 在构建时插件会直接访问该地址下载资源，
 * 不会影响前端的代理配置。
 *
 * 构建时的工作流程：
 * 1. 插件从配置的URLs中提取基础URL（http://localhost:1337/）
 * 2. 根据autoDiscovery.mode调用相应的发现方法
 * 3. 过滤发现的URL（根据扩展名和排除模式）
 * 4. 下载所有资源到指定目录
 * 5. 应用自定义文件名映射
 */