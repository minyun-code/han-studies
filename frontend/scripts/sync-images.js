// scripts/sync-images.js
const fs = require('fs');
const path = require('path');
const http = require('http');

const LOCAL_SERVER = 'http://127.0.0.1:1337';
const TARGET_DIR = path.join(process.cwd(), 'public', 'uploads');

// 自动创建目标目录 (兼容中文路径)
if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// 获取文件列表 (需本地服务支持目录列表接口)
// 获取文件列表 (需本地服务支持目录列表接口)
function fetchFileList() {
    return new Promise((resolve, reject) => {
      http.get(`${LOCAL_SERVER}/uploads/`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data.match(/href="([^"]+\.(?:jpg|png))"/g).map(m => m.slice(6, -1))));
      }).on('error', reject);
    });
  }

// 下载单个文件 (支持重试)
async function downloadFile(filename) {
  const filePath = path.join(TARGET_DIR, filename);
  const writer = fs.createWriteStream(filePath);

  return new Promise((resolve, reject) => {
    http.get(`${LOCAL_SERVER}/uploads/${encodeURIComponent(filename)}`, (res) => {
      res.pipe(writer);
      writer.on('finish', resolve);
      writer.on('error', reject);
    }).on('error', (err) => {
      fs.unlinkSync(filePath); // 删除不完整文件
      reject(err);
    });
  });
}

// 主流程
(async () => {
  try {
    const files = await fetchFileList();
    console.log(`Found ${files.length} files to sync`);

    for (const file of files) {
      console.log(`Downloading ${file}...`);
      await downloadFile(file);
    }

    console.log('Sync completed!');
  } catch (err) {
    console.error('Sync failed:', err);
    process.exit(1);
  }
})();