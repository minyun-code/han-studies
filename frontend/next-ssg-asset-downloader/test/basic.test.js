const { AssetDownloader } = require('../dist/index');
const path = require('path');
const fs = require('fs-extra');

// 简单的测试函数
async function runBasicTest() {
  console.log('🧪 开始基础功能测试...');

  const testConfig = {
    urls: [
      'https://httpbin.org/json', // 测试JSON文件
      'https://httpbin.org/robots.txt', // 测试文本文件
    ],
    outputDir: 'test-downloads',
    concurrency: 2,
    timeout: 10000,
    skipInDevelopment: false
  };

  const downloader = new AssetDownloader(testConfig, process.cwd());

  try {
    // 清理之前的测试文件
    const testDir = path.join(process.cwd(), 'test-downloads');
    if (await fs.pathExists(testDir)) {
      await fs.remove(testDir);
      console.log('✅ 清理了之前的测试文件');
    }

    // 执行下载
    console.log('📥 开始下载测试文件...');
    const results = await downloader.downloadAssets();

    // 验证结果
    console.log('📊 下载结果:');
    results.forEach((result, index) => {
      if (result.success) {
        console.log(`  ✅ ${index + 1}. ${result.url} -> ${result.localPath}`);
      } else {
        console.log(`  ❌ ${index + 1}. ${result.url} - 错误: ${result.error}`);
      }
    });

    // 检查文件是否存在
    console.log('🔍 验证文件是否存在:');
    for (const result of results) {
      if (result.success && result.localPath) {
        const fullPath = path.join(process.cwd(), result.localPath);
        const exists = await fs.pathExists(fullPath);
        console.log(`  ${exists ? '✅' : '❌'} ${result.localPath}`);

        if (exists) {
          const stats = await fs.stat(fullPath);
          console.log(`    文件大小: ${stats.size} bytes`);
        }
      }
    }

    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    console.log(`\n🎉 测试完成! 成功下载 ${successCount}/${totalCount} 个文件`);

    if (successCount === totalCount) {
      console.log('✅ 所有测试通过!');
      return true;
    } else {
      console.log('⚠️  部分测试失败');
      return false;
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    return false;
  }
}

// 测试工具函数
async function testUtils() {
  console.log('\n🔧 测试工具函数...');

  try {
    const {
      isValidUrl,
      getFileType,
      sanitizeFileName,
      formatFileSize,
      extractFileInfo
    } = require('../dist/utils');

    // 测试URL验证
    console.log('URL验证测试:');
    console.log(`  https://example.com: ${isValidUrl('https://example.com')}`);
    console.log(`  invalid-url: ${isValidUrl('invalid-url')}`);

    // 测试文件类型检测
    console.log('文件类型检测:');
    console.log(`  image.jpg: ${getFileType('image.jpg')}`);
    console.log(`  video.mp4: ${getFileType('video.mp4')}`);
    console.log(`  document.pdf: ${getFileType('document.pdf')}`);

    // 测试文件名清理
    console.log('文件名清理:');
    console.log(`  "file<>name.txt": "${sanitizeFileName('file<>name.txt')}"`);

    // 测试文件大小格式化
    console.log('文件大小格式化:');
    console.log(`  1024: ${formatFileSize(1024)}`);
    console.log(`  1048576: ${formatFileSize(1048576)}`);

    // 测试文件信息提取
    console.log('文件信息提取:');
    const fileInfo = extractFileInfo('https://example.com/path/to/file.jpg');
    console.log(`  URL: ${fileInfo.url}`);
    console.log(`  文件名: ${fileInfo.fileName}`);
    console.log(`  文件类型: ${fileInfo.fileType}`);

    console.log('✅ 工具函数测试通过!');
    return true;

  } catch (error) {
    console.error('❌ 工具函数测试失败:', error.message);
    return false;
  }
}

// 主测试函数
async function main() {
  console.log('🚀 Next.js SSG Asset Downloader 测试开始\n');

  const results = [];

  // 运行基础测试
  results.push(await runBasicTest());

  // 运行工具函数测试
  results.push(await testUtils());

  // 总结
  const passedTests = results.filter(Boolean).length;
  const totalTests = results.length;

  console.log(`\n📋 测试总结: ${passedTests}/${totalTests} 通过`);

  if (passedTests === totalTests) {
    console.log('🎉 所有测试都通过了!');
    process.exit(0);
  } else {
    console.log('❌ 有测试失败');
    process.exit(1);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main().catch(error => {
    console.error('💥 测试运行失败:', error);
    process.exit(1);
  });
}

module.exports = { runBasicTest, testUtils };