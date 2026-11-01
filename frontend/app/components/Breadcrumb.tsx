"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '../contexts/LanguageContext';
import { pathMap, virtualPaths } from '../constants/pathMap';

export default function Breadcrumb() {
  const pathname = usePathname();
  const { language } = useLanguage();

  // 移除开头的/并分割路径
  const pathSegments = pathname.split('/').filter(segment => segment);

  // 如果是首页，不显示面包屑
  if (pathSegments.length === 0) {
    return null;
  }

  // 构建面包屑导航项
  const breadcrumbItems = [
    { path: '/', label: pathMap["home"][language.toLowerCase() as 'ja'|'en'|'zh'] },
  ];

  // 添加每一级路径
  let currentPath = '';
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const pathKey = currentPath.substring(1); // 去掉前导/

    // 处理虚拟路径 - 获取实际应该导航的路径
    const actualPath = virtualPaths[currentPath] || currentPath;

    // 特殊处理动态路由
    const isLastSegment = index === pathSegments.length - 1;
    const isDynamicSegment = segment.startsWith('[') ||
                             (!isNaN(Number(segment)) ||
                             (segment !== 'events' && segment !== 'announcements' &&
                              pathSegments[index-1] === 'events'));

    let label;
    // 特殊处理事件详情页
    if (pathSegments[index-1] === 'events' && segment !== 'events') {
      // 事件详情页面
      switch(language.toLowerCase()) {
        case 'ja':
          label = "イベント詳細";
          break;
        case 'en':
          label = "Event Details";
          break;
        case 'zh':
        default:
          label = "活动详情";
          break;
      }
    } else if(pathSegments[index-1] === 'projects' && segment !== 'projects'){
      switch(language.toLowerCase()) {
        case 'ja':
          label = "詳細";
          break;
        case 'en':
          label = "Details";
          break;
        case 'zh':
        default:
          label = "详情";
          break;
      }
    }else if(pathSegments[index-1] === 'symposium' && segment !== 'symposium'){
      switch(language.toLowerCase()) {
        case 'ja':
          label = "詳細";
          break;
        case 'en':
          label = "Details";
          break;
        case 'zh':
        default:
          label = "详情";
          break;
      }
    }else if(pathSegments[index-1] === 'announcements' && segment !== 'announcements'){
      switch(language.toLowerCase()) {
        case 'ja':
          label = "ニュース詳細";
          break;
        case 'en':
          label = "News Details";
          break;
        case 'zh':
        default:
          label = "新闻详情";
          break;
      }
    }
    // 其他动态路由
    else if (isDynamicSegment) {
      const parentSegment = index > 0 ? pathSegments[index - 1] : '';
      const parentKey = parentSegment === 'news' ? 'news' : parentSegment;
      const parentLabel = pathMap[parentKey] ?
        pathMap[parentKey][language.toLowerCase() as 'ja'|'en'|'zh'] :
        parentSegment;

      // 根据语言添加"详情"后缀
      switch(language.toLowerCase()) {
        case 'ja':
          label = `${parentLabel}詳細`;
          break;
        case 'en':
          label = `${parentLabel} Details`;
          break;
        case 'zh':
        default:
          label = `${parentLabel}详情`;
          break;
      }
    } else {
      // 使用映射表中的标签，如果没有则使用路径段
      label = pathMap[pathKey] ?
        pathMap[pathKey][language.toLowerCase() as 'ja'|'en'|'zh'] :
        segment;
    }

    breadcrumbItems.push({
      path: isLastSegment ? '#' : actualPath, // 使用实际路径替代虚拟路径
      label
    });
  });

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-2 px-6 shadow-md">
      <div className="max-w-8xl mx-auto">
        <ol className="flex flex-wrap items-center text-sm">
          {breadcrumbItems.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-gray-400">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                  </svg>
                </span>
              )}
              {item.path === '#' ? (
                <span className="font-semibold text-purple-300">{item.label}</span>
              ) : (
                <Link
                  href={item.path}
                  className="hover:text-blue-300 transition-colors duration-200"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}