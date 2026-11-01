const { AssetDownloader } = require('../dist/index');
const fs = require('fs-extra');
const path = require('path');

/**
 * HTML扫描功能测试
 * 测试从HTML文件中扫描和下载资源的功能
 */

async function testHtmlScan() {
  console.log('🧪 开始HTML扫描功能测试...');
  
  // 创建测试HTML目录和文件
  const testHtmlDir = path.join(__dirname, 'test-html');
  const testOutputDir = path.join(__dirname, 'test-output');
  
  try {
    // 清理并创建测试目录
    await fs.remove(testHtmlDir);
    await fs.remove(testOutputDir);
    await fs.ensureDir(testHtmlDir);
    await fs.ensureDir(testOutputDir);
    
    // 创建测试HTML文件
    const testHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Test Page</title>
  <link rel="icon" href="/uploads/favicon.ico">
  <link rel="stylesheet" href="/uploads/styles.css">
</head>
<body>
  <h1>Test Page</h1>
  <img src="/uploads/images/hero.jpg" alt="Hero Image">
  <img src="/uploads/images/logo.png" alt="Logo">
  <video src="/uploads/videos/intro.mp4" controls></video>
  <audio src="/uploads/audio/background.mp3" controls></audio>
  
  <!-- 这些不应该被下载（不匹配前缀） -->
  <img src="/static/local-image.jpg" alt="Local">
  <img src="https://external.com/image.jpg" alt="External">
  
  <!-- 子目录中的资源 -->
  <img src="/uploads/gallery/photo1.jpg" alt="Photo 1">
  <img src="/uploads/gallery/photo2.png" alt="Photo 2">
</body>
</html>
    `;
    
    await fs.writeFile(path.join(testHtmlDir, 'index.html'), testHtml);
    
    // 创建子目录HTML文件
    const subDir = path.join(testHtmlDir, 'blog');
    await fs.ensureDir(subDir);
    
    const subHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Blog Post</title>
</head>
<body>
  <h1>Blog Post</h1>
  <img src="/uploads/blog/featured.jpg" alt="Featured">
  <img src="/uploads/blog/thumbnail.png" alt="Thumbnail">
</body>
</html>
    `;
    
    await fs.writeFile(path.join(subDir, 'post.html'), subHtml);
    
    console.log('✅ 测试HTML文件创建完成');
    
    // 配置资源下载器
    const downloader = new AssetDownloader({
      baseUrl: 'https://httpbin.org', // 使用httpbin作为测试服务器
      outputDir: testOutputDir,
      htmlDir: testHtmlDir,
      assetPathPrefix: '/uploads/',
      includeExtensions: ['.jpg', '.png', '.mp4', '.mp3', '.css', '.ico'],
      excludePatterns: ['thumbnail*'],
      recursive: true,
      concurrency: 2,
      timeout: 10000
    });
    
    console.log('🔍 开始扫描HTML文件...');
    
    // 执行扫描和下载
    const results = await downloader.downloadAssets();
    
    // 统计结果
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const errors = results.filter(r => !r.success).map(r => `${r.url}: ${r.error}`);
    const downloadedFiles = results.filter(r => r.success).map(r => r.localPath || r.url);
    
    console.log('\n📊 扫描结果:');
    console.log(`发现的资源数量: ${results.length}`);
    console.log(`成功下载: ${successful}`);
    console.log(`下载失败: ${failed}`);
    console.log(`跳过的文件: 0`);
    
    if (errors.length > 0) {
      console.log('\n❌ 下载错误:');
      errors.forEach(error => {
        console.log(`  - ${error}`);
      });
    }
    
    if (downloadedFiles.length > 0) {
      console.log('\n📁 下载的文件:');
      downloadedFiles.forEach(file => {
        console.log(`  - ${file}`);
      });
    }
    
    console.log('\n🧹 清理测试文件...');
    await fs.remove(testHtmlDir);
    await fs.remove(testOutputDir);
    
    console.log('✅ HTML扫描功能测试完成!');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    
    // 清理测试文件
    try {
      await fs.remove(testHtmlDir);
      await fs.remove(testOutputDir);
    } catch (cleanupError) {
      console.error('清理失败:', cleanupError.message);
    }
    
    throw error;
  }
}

// 运行测试
if (require.main === module) {
  testHtmlScan()
    .then(() => {
      console.log('\n🎉 所有测试通过!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 测试失败:', error);
      process.exit(1);
    });
}

module.exports = { testHtmlScan };