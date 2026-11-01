const { withAssetDownloader } = require('next-ssg-asset-downloader');

// 基础Next.js配置
const nextConfig = {
  output: 'export', // 启用SSG
  trailingSlash: true,
  images: {
    unoptimized: true // SSG需要
  }
};

// 资源下载配置示例
const assetConfig = {
  // 要下载的资源URL列表
  urls: [
    // 图片资源
    'https://api.example.com/uploads/hero-image.jpg',
    'https://api.example.com/uploads/gallery/image1.png',
    'https://api.example.com/uploads/gallery/image2.jpg',

    // 文档资源
    'https://api.example.com/files/brochure.pdf',
    'https://api.example.com/files/manual.pdf',

    // 其他媒体文件
    'https://api.example.com/media/intro-video.mp4',
    'https://api.example.com/media/background-music.mp3'
  ],

  // 下载到public/assets目录
  outputDir: 'public/assets',

  // 保持原始文件名
  keepOriginalName: true,

  // 自定义文件名映射（可选）
  fileNameMapper: (url, index) => {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const fileName = pathname.split('/').pop() || `asset-${index}`;

    // 为不同类型的文件添加前缀
    if (fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return `img-${fileName}`;
    } else if (fileName.match(/\.(pdf|doc|docx)$/i)) {
      return `doc-${fileName}`;
    } else if (fileName.match(/\.(mp4|avi|mov|webm)$/i)) {
      return `video-${fileName}`;
    } else if (fileName.match(/\.(mp3|wav|ogg|flac)$/i)) {
      return `audio-${fileName}`;
    }

    return fileName;
  },

  // 并发下载数量
  concurrency: 3,

  // 下载超时时间（30秒）
  timeout: 30000,

  // 开发环境跳过下载
  skipInDevelopment: true
};

// 导出配置
module.exports = withAssetDownloader(assetConfig)(nextConfig);

// 如果你需要在构建后获取下载结果，可以这样做：
// const { AssetDownloader } = require('next-ssg-asset-downloader');
//
// async function downloadAssets() {
//   const downloader = new AssetDownloader(assetConfig, process.cwd());
//   const results = await downloader.downloadAssets();
//   console.log('Download results:', results);
// }
//
// // 在需要的时候调用
// if (process.env.NODE_ENV === 'production') {
//   downloadAssets();
// }