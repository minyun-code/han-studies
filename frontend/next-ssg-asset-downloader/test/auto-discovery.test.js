const { AssetDownloader } = require('../dist/index');
const path = require('path');
const fs = require('fs-extra');

/**
 * 测试自动发现功能
 */
async function testAutoDiscovery() {
  console.log('\n=== 测试自动发现功能 ===');

  // 模拟配置
  const config = {
    urls: ['http://localhost:1337/'],
    outputDir: 'test-output/auto-discovery',
    autoDiscovery: {
      enabled: true,
      mode: 'api',
      apiEndpoint: '/api/upload/files',
      includeExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
      excludePatterns: ['thumbnail_', 'temp_'],
      maxDepth: 2
    },
    skipInDevelopment: false,
    concurrency: 2,
    timeout: 10000
  };

  try {
    // 清理测试目录
    const testDir = path.resolve(process.cwd(), config.outputDir);
    await fs.remove(testDir);

    console.log('配置:', JSON.stringify(config, null, 2));

    // 创建下载器实例
    const downloader = new AssetDownloader(config, process.cwd());

    console.log('\n开始测试自动发现...');

    // 注意：这个测试需要实际的服务器运行在 localhost:1337
    // 如果服务器不可用，测试会显示相应的错误信息
    const results = await downloader.downloadAssets();

    console.log('\n自动发现测试结果:');
    console.log(`- 总共处理: ${results.length} 个资源`);
    console.log(`- 成功下载: ${results.filter(r => r.success).length} 个`);
    console.log(`- 下载失败: ${results.filter(r => !r.success).length} 个`);

    if (results.length > 0) {
      console.log('\n下载详情:');
      results.forEach((result, index) => {
        console.log(`${index + 1}. ${result.url}`);
        console.log(`   状态: ${result.success ? '成功' : '失败'}`);
        if (result.success) {
          console.log(`   文件: ${result.filePath}`);
          console.log(`   大小: ${result.fileSize} 字节`);
        } else {
          console.log(`   错误: ${result.error}`);
        }
        console.log('');
      });
    }

    // 检查下载的文件
    if (await fs.pathExists(testDir)) {
      const files = await fs.readdir(testDir);
      console.log(`\n下载目录中的文件: ${files.length} 个`);
      files.forEach(file => {
        console.log(`- ${file}`);
      });
    }

  } catch (error) {
    console.error('自动发现测试失败:', error.message);

    if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
      console.log('\n提示: 请确保 http://localhost:1337/ 服务正在运行');
      console.log('如果您使用的是 Strapi，请启动 Strapi 开发服务器');
    }
  }
}

/**
 * 测试URL提取功能
 */
function testUrlExtraction() {
  console.log('\n=== 测试URL提取功能 ===');

  const config = {
    urls: [
      'http://localhost:1337/uploads/image1.jpg',
      'https://example.com/assets/image2.png',
      'http://localhost:1337/api/files/document.pdf'
    ],
    outputDir: 'test-output',
    autoDiscovery: { enabled: false }
  };

  const downloader = new AssetDownloader(config, process.cwd());

  // 通过反射访问私有方法（仅用于测试）
  const extractBaseUrls = downloader.extractBaseUrls.bind(downloader);
  const baseUrls = extractBaseUrls();

  console.log('输入URLs:', config.urls);
  console.log('提取的基础URLs:', baseUrls);

  const expectedBaseUrls = ['http://localhost:1337', 'https://example.com'];
  const isCorrect = baseUrls.length === expectedBaseUrls.length &&
                   baseUrls.every(url => expectedBaseUrls.includes(url));

  console.log('测试结果:', isCorrect ? '✅ 通过' : '❌ 失败');
}

/**
 * 测试URL过滤功能
 */
function testUrlFiltering() {
  console.log('\n=== 测试URL过滤功能 ===');

  const config = {
    urls: [],
    outputDir: 'test-output',
    autoDiscovery: {
      enabled: true,
      includeExtensions: ['.jpg', '.png'],
      excludePatterns: ['thumbnail_', 'temp_']
    }
  };

  const downloader = new AssetDownloader(config, process.cwd());

  const testUrls = [
    'http://example.com/image.jpg',      // 应该包含
    'http://example.com/photo.png',      // 应该包含
    'http://example.com/document.pdf',   // 应该排除（扩展名）
    'http://example.com/thumbnail_pic.jpg', // 应该排除（模式）
    'http://example.com/temp_file.png',  // 应该排除（模式）
    'http://example.com/normal.gif'      // 应该排除（扩展名）
  ];

  // 通过反射访问私有方法（仅用于测试）
  const filterDiscoveredUrls = downloader.filterDiscoveredUrls.bind(downloader);
  const filteredUrls = filterDiscoveredUrls(testUrls, config.autoDiscovery);

  console.log('输入URLs:', testUrls);
  console.log('过滤后URLs:', filteredUrls);

  const expectedUrls = [
    'http://example.com/image.jpg',
    'http://example.com/photo.png'
  ];

  const isCorrect = filteredUrls.length === expectedUrls.length &&
                   filteredUrls.every(url => expectedUrls.includes(url));

  console.log('测试结果:', isCorrect ? '✅ 通过' : '❌ 失败');
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('开始运行自动发现功能测试...');

  // 运行单元测试
  testUrlExtraction();
  testUrlFiltering();

  // 运行集成测试（需要实际服务器）
  await testAutoDiscovery();

  console.log('\n所有测试完成！');
}

// 如果直接运行此文件，则执行测试
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testAutoDiscovery,
  testUrlExtraction,
  testUrlFiltering,
  runAllTests
};