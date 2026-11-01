import * as path from 'path';
import { FileType, FileInfo } from './types';

/**
 * 根据文件扩展名判断文件类型
 */
export function getFileType(fileName: string): FileType {
  const ext = path.extname(fileName).toLowerCase();

  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];
  const videoExts = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.m4v'];
  const audioExts = ['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a', '.wma'];
  const documentExts = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.rtf'];
  const archiveExts = ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2'];

  if (imageExts.includes(ext)) return FileType.IMAGE;
  if (videoExts.includes(ext)) return FileType.VIDEO;
  if (audioExts.includes(ext)) return FileType.AUDIO;
  if (documentExts.includes(ext)) return FileType.DOCUMENT;
  if (archiveExts.includes(ext)) return FileType.ARCHIVE;

  return FileType.OTHER;
}

/**
 * 从URL提取文件信息
 */
export function extractFileInfo(url: string): FileInfo {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const fileName = path.basename(pathname) || 'unknown';
    const fileType = getFileType(fileName);

    return {
      url,
      fileName,
      fileType
    };
  } catch (error) {
    return {
      url,
      fileName: 'invalid-url',
      fileType: FileType.OTHER
    };
  }
}

/**
 * 生成安全的文件名（移除特殊字符）
 */
export function sanitizeFileName(fileName: string): string {
  // 移除或替换不安全的字符
  return fileName
    .replace(/[<>:"/\\|?*]/g, '_') // 替换Windows不允许的字符
    .replace(/[\x00-\x1f\x80-\x9f]/g, '') // 移除控制字符
    .replace(/^\.|\.$/, '') // 移除开头和结尾的点
    .replace(/\s+/g, '_') // 替换空格为下划线
    .substring(0, 255); // 限制文件名长度
}

/**
 * 验证URL是否有效
 */
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 创建默认的文件名映射函数
 */
export function createDefaultFileNameMapper(prefix?: string, addTimestamp?: boolean) {
  return (url: string, index: number): string => {
    const fileInfo = extractFileInfo(url);
    let fileName = fileInfo.fileName;

    if (prefix) {
      const ext = path.extname(fileName);
      const baseName = path.basename(fileName, ext);
      fileName = `${prefix}-${baseName}${ext}`;
    }

    if (addTimestamp) {
      const ext = path.extname(fileName);
      const baseName = path.basename(fileName, ext);
      const timestamp = Date.now();
      fileName = `${baseName}-${timestamp}${ext}`;
    }

    return sanitizeFileName(fileName);
  };
}

/**
 * 延迟函数
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 重试函数
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (i < maxRetries) {
        console.warn(`Retry ${i + 1}/${maxRetries} after ${delayMs}ms:`, lastError.message);
        await delay(delayMs);
        delayMs *= 2; // 指数退避
      }
    }
  }

  throw lastError!;
}

/**
 * 检查文件是否已存在
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    const fs = await import('fs-extra');
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * 获取文件的MIME类型
 */
export function getMimeType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();

  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.mp4': 'video/mp4',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.zip': 'application/zip',
    '.json': 'application/json',
    '.txt': 'text/plain',
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript'
  };

  return mimeTypes[ext] || 'application/octet-stream';
}