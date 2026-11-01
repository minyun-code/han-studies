const { withAssetDownloader } = require('next-ssg-asset-downloader/dist');

/** @type {import('next').NextConfig} */
const nextConfig = {
    output:'export',
    // 关闭源码映射生成
    productionBrowserSourceMaps: true,
    // 禁用类型检查（构建时）
    typescript: { ignoreBuildErrors: true },
    // 关闭 ESLint 校验
    eslint: { ignoreDuringBuilds: true },
  cacheMaxMemorySize: 0, // 禁用内存缓存，使用文件缓存
  images: {

    unoptimized: true,
    domains: ["127.0.0.1"],  // 允许 `127.0.0.1` 作为图片域名
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3000",
        pathname: "/uploads/**", // 确保 `/uploads/` 目录的图片可被加载
      },
    ],
  },
  // 开发环境代理配置
  async rewrites() {
    console.log(process.env.NODE_ENV,'process.env.NODE_ENV')
    return process.env.NODE_ENV === 'development'
      ? [
          {
            source: '/uploads/:path*',
            destination: 'http://127.0.0.1:1337/uploads/:path*' // 本地CMS服务
          }
        ]
      : [

      ]
  }
};

// 配置资源下载
const assetConfig = {
  baseUrl: 'http://localhost:1337', // 远程资源的基础URL
  outputDir: 'public/uploads', // 下载到 public/downloads 目录
  htmlDir: 'out', // Next.js export 输出目录
  assetPathPrefix: '/uploads/', // 只下载以此路径开头的资源

};

module.exports = nextConfig


module.exports = withAssetDownloader(assetConfig)(nextConfig);



