"use client";
import React, { createContext, useState, useContext, ReactNode } from 'react';

// 定义支持的语言类型
export type LanguageType = 'ZH' | 'JA' | 'EN';

// 定义上下文类型
type LanguageContextType = {
  language: LanguageType;
  setLanguage: (lang: LanguageType) => void;
  t: (key: string) => string;
};

// 创建语言上下文
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 翻译数据
const translations: Record<LanguageType, Record<string, string>> = {
  ZH: {
    // 导航菜单
    "研究所について": "关于研究所",
    "研究所長挨拶": "所长致辞",
    "研究所の概要": "研究所概要",
    "研究員紹介": "研究员介绍",
    "研究活動": "研究活动",
    "プロジェクト・研究テーマ": "项目与研究主题",
    "研究会・セミナー情報": "研讨会与研讨会信息",
    "公開講座・シンポジウム": "公开课程与研讨会",
    "出版物・資料": "出版物与资料",
    "ニュース・イベント": "新闻与活动",
    "ニュース": "新闻",
    "イベント情報": "活动信息",
    "フォトギャラリー": "图片库",
    "お問い合わせ": "联系我们",
    "関連リンク": "相关链接",

    // 搜索栏
    "検索キーワードを入力...": "请输入搜索关键词...",

    // 其他通用文本
    "読み込み中...": "加载中...",
    "データがありません": "暂无数据",
    "詳細を見る": "查看详情",
    "もっと見る": "查看更多"
  },
  JA: {
    // 原始日语文本，作为默认值，可以是空对象
  },
  EN: {
    // 导航菜单
    "研究所について": "About the Institute",
    "研究所長挨拶": "Director's Greeting",
    "研究所の概要": "Institute Overview",
    "研究員紹介": "Researchers",
    "研究活動": "Research Activities",
    "プロジェクト・研究テーマ": "Projects & Research Themes",
    "研究会・セミナー情報": "Workshops & Seminars",
    "公開講座・シンポジウム": "Public Lectures & Symposiums",
    "出版物・資料": "Publications & Resources",
    "ニュース・イベント": "News & Events",
    "ニュース": "News",
    "イベント情報": "Event Information",
    "お問い合わせ": "Contact Us",
    "関連リンク": "Related Links",

    // 搜索栏
    "検索キーワードを入力...": "Enter search keywords...",

    // 其他通用文本
    "読み込み中...": "Loading...",
    "データがありません": "No data available",
    "詳細を見る": "View Details",
    "もっと見る": "View More"
  }
};

// 语言提供者组件
export const LanguageProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [language, setLanguage] = useState<LanguageType>('JA');

  // 翻译函数
  const t = (key: string): string => {
    // 日语模式直接返回原文
    if (language === 'JA') return key;

    // 其他语言查找翻译
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// 自定义钩子，用于在组件中访问语言上下文
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};