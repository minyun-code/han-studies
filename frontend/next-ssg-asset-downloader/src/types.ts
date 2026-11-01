import { NextConfig } from 'next';

/**
 * 资源下载器配置接口
 */
export interface AssetDownloaderConfig {
  /** 要下载的资源URL列表 */
  urls: string[];
  /** 下载到的目标文件夹，相对于项目根目录 */
  outputDir: string;
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
}

/**
 * 下载结果接口
 */
export interface DownloadResult {
  /** 原始URL */
  url: string;
  /** 是否下载成功 */
  success: boolean;
  /** 本地文件路径（相对于项目根目录） */
  localPath?: string;
  /** 错误信息（如果下载失败） */
  error?: string;
}

/**
 * Next.js配置增强函数类型
 */
export type NextConfigEnhancer = (config?: NextConfig) => NextConfig;

/**
 * Webpack配置上下文
 */
export interface WebpackContext {
  buildId: string;
  dev: boolean;
  isServer: boolean;
  defaultLoaders: any;
  webpack: any;
}

/**
 * 文件类型枚举
 */
export enum FileType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  ARCHIVE = 'archive',
  OTHER = 'other'
}

/**
 * 文件信息接口
 */
export interface FileInfo {
  url: string;
  fileName: string;
  fileType: FileType;
  size?: number;
  mimeType?: string;
}

/**
 * 下载进度回调函数类型
 */
export type ProgressCallback = (progress: {
  url: string;
  loaded: number;
  total: number;
  percentage: number;
}) => void;

/**
 * 扩展的资源下载器配置（未来版本可能支持）
 */
export interface ExtendedAssetDownloaderConfig extends AssetDownloaderConfig {
  /** 进度回调函数 */
  onProgress?: ProgressCallback;
  /** 下载前的URL过滤函数 */
  urlFilter?: (url: string) => boolean;
  /** 下载前的URL转换函数 */
  urlTransformer?: (url: string) => string;
  /** 是否验证文件完整性 */
  validateIntegrity?: boolean;
  /** 重试次数 */
  retryCount?: number;
  /** 重试延迟（毫秒） */
  retryDelay?: number;
}