// 演示如何在han-studies项目中使用next-ssg-asset-downloader插件
const { withAssetDownloader } = require('./dist/index');

// 模拟从Strapi CMS获取的资源URL列表
const strapiAssets = [
  'http://localhost:1337/uploads/slider_1_abc123.jpg',
  'http://localhost:1337/uploads/slider_2_def456.jpg',
  'http://localhost:1337/uploads/slider_3_ghi789.jpeg',
  'http://localhost:1337/uploads/logo_jkl012.png',
  'http://localhost:1337/uploads/watanabe_mno345.jpg',
  'http://localhost:1337/uploads/organization_chart_pqr678.png'
];

// 基础Next.js配置（基于han-studies项目）
const nextConfig = {
  output: 'export', // SSG模式
  productionBrowserSourceMaps: true,
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  cacheMaxMemorySize: 0,
  images: {
    unoptimized: true,
    domains: ["127.0.0.1"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3000",
        pathname: "/uploads/**",
      },
    ],
  },
  // 在生产环境中不需要rewrites，因为资源已经下载到本地
  async rewrites() {
    return process.env.NODE_ENV === 'development'
      ? [
          {
            source: '/uploads/:path*',
            destination: 'http://127.0.0.1:1337/uploads/:path*'
          }
        ]
      : [];
  }
};

// 资源下载配置
const assetConfig = {
  // 要下载的资源URL列表
  urls: strapiAssets,

  // 下载到public/uploads目录，保持与开发环境的路径一致
  outputDir: 'public/uploads',

  // 自定义文件名映射，移除Strapi添加的随机后缀
  fileNameMapper: (url, index) => {
    const urlObj = new URL(url);
    const originalFileName = urlObj.pathname.split('/').pop() || `asset-${index}`;

    // 如果文件名包含下划线，可能是Strapi添加的随机后缀
    // 例如: slider_1_abc123.jpg -> slider_1.jpg
    const cleanFileName = originalFileName.replace(/_[a-zA-Z0-9]{6,}(\.[^.]+)$/, '$1');

    return cleanFileName;
  },

  // 并发下载数量
  concurrency: 3,

  // 下载超时时间（30秒）
  timeout: 30000,

  // 开发环境跳过下载（因为开发环境使用rewrites代理）
  skipInDevelopment: true
};

// 导出增强的Next.js配置
module.exports = withAssetDownloader(assetConfig)(nextConfig);

// 使用说明：
// 1. 将此文件重命名为 next.config.js 并替换项目根目录的配置文件
// 2. 安装插件: npm install ./next-ssg-asset-downloader
// 3. 运行构建: npm run build
// 4. 插件会在构建时自动下载所有指定的资源到 public/uploads 目录
// 5. 构建完成后，静态站点将包含所有必要的资源文件