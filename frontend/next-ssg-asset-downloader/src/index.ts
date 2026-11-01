import * as fs from 'fs-extra';
import * as path from 'path';
import fetch from 'node-fetch';
import { NextConfig } from 'next';

export interface AssetDownloaderConfig {
  /** 要下载的资源URL列表（可选，如果不提供则从HTML中自动发现） */
  urls?: string[];
  /** 下载到的目标文件夹，相对于项目根目录 */
  outputDir: string;
  /** 远程资源的基础URL，用于解析相对路径 */
  baseUrl: string;
  /** 要扫描的HTML输出目录，默认为'out'（Next.js export输出目录） */
  htmlDir?: string;
  /** 要匹配的资源路径前缀，例如'/uploads/'表示只下载以此开头的资源 */
  assetPathPrefix?: string;
  /** 是否保持原始文件名，默认为true */
  keepOriginalName?: boolean;
  /** 文件名映射函数，可以自定义文件名 */
  fileNameMapper?: (url: string, index: number) => string;
  /** 并发下载数量限制，默认为5 */
  concurrency?: number;
  /** 下载超时时间（毫秒），默认为30000 */
  timeout?: number;
  /** 是否在开发环境中跳过下载，默认为true */
  skipInDevelopment?: boolean;
  /** 要包含的文件扩展名，默认为常见的媒体文件 */
  includeExtensions?: string[];
  /** 要排除的路径模式 */
  excludePatterns?: string[];
  /** 是否递归扫描子目录的HTML文件，默认为true */
  recursive?: boolean;
}

export interface DownloadResult {
  url: string;
  success: boolean;
  localPath?: string;
  error?: string;
}

class AssetDownloader {
  private config: Required<AssetDownloaderConfig>;
  private projectRoot: string;

  constructor(config: AssetDownloaderConfig, projectRoot: string) {
    this.config = {
      urls: [],
      htmlDir: 'out',
      assetPathPrefix: '',
      keepOriginalName: true,
      fileNameMapper: (url: string, index: number) => {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const fileName = path.basename(pathname) || `asset-${index}`;
        return fileName;
      },
      concurrency: 5,
      timeout: 30000,
      skipInDevelopment: true,
      includeExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.mp4', '.mp3', '.pdf', '.zip'],
      excludePatterns: [],
      recursive: true,
      ...config
    };
    this.projectRoot = projectRoot;
  }

  async downloadAssets(): Promise<DownloadResult[]> {
    // 检查是否在开发环境中跳过
    if (this.config.skipInDevelopment && process.env.NODE_ENV === 'development') {
      console.log('[AssetDownloader] Skipping download in development mode');
      return [];
    }

    const outputPath = path.resolve(this.projectRoot, this.config.outputDir);

    // 确保输出目录存在
    await fs.ensureDir(outputPath);

    // 获取要下载的URL列表
    let urlsToDownload = [...(this.config.urls || [])];

    // 从HTML文件中发现资源
    console.log('[AssetDownloader] Scanning HTML files for assets...');
    const discoveredUrls = await this.scanHtmlForAssets();
    urlsToDownload = [...new Set([...urlsToDownload, ...discoveredUrls])];
    console.log(`[AssetDownloader] Found ${discoveredUrls.length} assets in HTML files`);

    if (urlsToDownload.length === 0) {
      console.log('[AssetDownloader] No assets found to download');
      return [];
    }

    console.log(`[AssetDownloader] Starting download of ${urlsToDownload.length} assets to ${outputPath}`);

    // 分批下载以控制并发
    const results: DownloadResult[] = [];
    const chunks = this.chunkArray(urlsToDownload, this.config.concurrency);

    for (const chunk of chunks) {
      const chunkResults = await Promise.all(
        chunk.map((url, index) => this.downloadSingleAsset(url, index, outputPath))
      );
      results.push(...chunkResults);
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`[AssetDownloader] Download completed: ${successCount} success, ${failCount} failed`);

    if (failCount > 0) {
      console.warn('[AssetDownloader] Failed downloads:');
      results.filter(r => !r.success).forEach(r => {
        console.warn(`  - ${r.url}: ${r.error}`);
      });
    }

    return results;
  }

  private async downloadSingleAsset(url: string, index: number, outputPath: string): Promise<DownloadResult> {
    try {
      console.log(`[AssetDownloader] Downloading: ${url}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'next-ssg-asset-downloader/1.0.0'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const fileName = this.config.keepOriginalName
        ? this.config.fileNameMapper(url, index)
        : `asset-${index}-${Date.now()}`;

      const filePath = path.join(outputPath, fileName);
      const buffer = await response.buffer();

      await fs.writeFile(filePath, buffer);

      console.log(`[AssetDownloader] Downloaded: ${url} -> ${filePath}`);

      return {
        url,
        success: true,
        localPath: path.relative(this.projectRoot, filePath)
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[AssetDownloader] Failed to download ${url}: ${errorMessage}`);

      return {
        url,
        success: false,
        error: errorMessage
      };
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * 扫描HTML文件中的资源引用
   */
  private async scanHtmlForAssets(): Promise<string[]> {
    const htmlDir = path.resolve(this.projectRoot, this.config.htmlDir!);
    const discoveredUrls: string[] = [];

    try {
      // 检查HTML目录是否存在
      const exists = await fs.pathExists(htmlDir);
      if (!exists) {
        console.warn(`[AssetDownloader] HTML directory not found: ${htmlDir}`);
        return [];
      }

      // 获取所有HTML文件
      const htmlFiles = await this.getHtmlFiles(htmlDir);
      console.log(`[AssetDownloader] Found ${htmlFiles.length} HTML files to scan`);

      // 扫描每个HTML文件
      for (const htmlFile of htmlFiles) {
        const urls = await this.extractAssetsFromHtml(htmlFile);
        discoveredUrls.push(...urls);
      }

      // 去重并过滤
      const uniqueUrls = [...new Set(discoveredUrls)];
      const filteredUrls = this.filterUrls(uniqueUrls);
      
      return filteredUrls;
    } catch (error) {
      console.warn(`[AssetDownloader] Failed to scan HTML files:`, error);
      return [];
    }
  }

  /**
   * 递归获取HTML文件列表
   */
  private async getHtmlFiles(dir: string): Promise<string[]> {
    const htmlFiles: string[] = [];
    const items = await fs.readdir(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory() && this.config.recursive) {
        const subFiles = await this.getHtmlFiles(fullPath);
        htmlFiles.push(...subFiles);
      } else if (item.isFile() && path.extname(item.name).toLowerCase() === '.html') {
        htmlFiles.push(fullPath);
      }
    }

    return htmlFiles;
  }

  /**
   * 从HTML文件中提取资源URL
   */
  private async extractAssetsFromHtml(htmlFile: string): Promise<string[]> {
    const urls: string[] = [];
    
    try {
      const content = await fs.readFile(htmlFile, 'utf-8');
      
      // 匹配各种资源标签
      const patterns = [
        /<img[^>]+src=["']([^"']+)["']/gi,
        /<video[^>]+src=["']([^"']+)["']/gi,
        /<audio[^>]+src=["']([^"']+)["']/gi,
        /<source[^>]+src=["']([^"']+)["']/gi,
        /<link[^>]+href=["']([^"']+)["'][^>]*rel=["']stylesheet["']/gi,
        /<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi,
        /<script[^>]+src=["']([^"']+)["']/gi,
        /<a[^>]+href=["']([^"']+\.(pdf|zip|doc|docx|xls|xlsx|ppt|pptx))["']/gi
      ];

      for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const url = match[1];
          if (url && this.isValidAssetUrl(url)) {
            urls.push(this.resolveAssetUrl(url));
          }
        }
      }
    } catch (error) {
      console.warn(`[AssetDownloader] Failed to read HTML file ${htmlFile}:`, error);
    }

    return urls;
  }

  /**
   * 检查是否为有效的资源URL
   */
  private isValidAssetUrl(url: string): boolean {
    // 跳过data URLs和javascript URLs
    if (url.startsWith('data:') || url.startsWith('javascript:') || url.startsWith('#')) {
      return false;
    }

    // 如果配置了路径前缀，检查是否匹配
    if (this.config.assetPathPrefix && !url.includes(this.config.assetPathPrefix)) {
      return false;
    }

    // 检查文件扩展名
    const ext = path.extname(url.split('?')[0]).toLowerCase();
    return this.config.includeExtensions.includes(ext);
  }

  /**
   * 解析资源URL为完整URL
   */
  private resolveAssetUrl(url: string): string {
    // 如果已经是完整URL，直接返回
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // 解析相对URL
    try {
      return new URL(url, this.config.baseUrl).href;
    } catch {
      // 如果解析失败，尝试简单拼接
      const baseUrl = this.config.baseUrl.endsWith('/') ? this.config.baseUrl.slice(0, -1) : this.config.baseUrl;
      const assetUrl = url.startsWith('/') ? url : '/' + url;
      return baseUrl + assetUrl;
    }
  }

  /**
   * 过滤URL列表
   */
  private filterUrls(urls: string[]): string[] {
    return urls.filter(url => {
      // 检查排除模式
      for (const pattern of this.config.excludePatterns) {
        if (url.includes(pattern)) {
          return false;
        }
      }
      return true;
    });
  }








}

/**
 * Next.js插件工厂函数
 * @param assetConfig 资源下载配置
 * @returns Next.js配置函数
 */
export function withAssetDownloader(assetConfig: AssetDownloaderConfig) {
  return function(nextConfig: NextConfig = {}): NextConfig {
    return {
      ...nextConfig,
      webpack: (config: any, { buildId, dev, isServer, defaultLoaders, webpack }: any) => {
        // 只在服务端构建时执行下载
        if (isServer && !dev) {
          const downloader = new AssetDownloader(assetConfig, process.cwd());

          // 在webpack编译开始前下载资源
          config.plugins = config.plugins || [];
          config.plugins.push(new webpack.DefinePlugin({
            __ASSET_DOWNLOADER_TRIGGER__: JSON.stringify(true)
          }));

          // 使用webpack的hooks来在适当时机下载资源
          config.plugins.push({
            apply: (compiler: any) => {
              compiler.hooks.beforeCompile.tapAsync('AssetDownloader', async (params: any, callback: any) => {
                try {
                  await downloader.downloadAssets();
                  callback();
                } catch (error) {
                  console.error('[AssetDownloader] Download failed:', error);
                  callback(error);
                }
              });
            }
          });
        }

        // 调用原始的webpack配置
        if (typeof nextConfig.webpack === 'function') {
          return nextConfig.webpack(config, { buildId, dev, isServer, defaultLoaders, webpack } as any);
        }

        return config;
      }
    };
  };
}

export default withAssetDownloader;
export { AssetDownloader };