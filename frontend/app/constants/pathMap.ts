// 页面路径映射表，用于翻译路径名称和搜索功能
export const pathMap: Record<string, { ja: string; en: string; zh: string; path: string }> = {
  "home": { 
    ja: "ホーム", 
    en: "Home", 
    zh: "首页",
    path: "/"
  },
  "about": { 
    ja: "研究所について", 
    en: "About", 
    zh: "关于研究所",
    path: "/about/overview"
  },
  "about/greeting": { 
    ja: "研究所長挨拶", 
    en: "Director's Greeting", 
    zh: "所长致辞",
    path: "/about/greeting"
  },
  "about/overview": { 
    ja: "研究所の概要", 
    en: "Overview", 
    zh: "研究所概况",
    path: "/about/overview"
  },
  "about/researchers": { 
    ja: "研究員紹介", 
    en: "Researchers", 
    zh: "研究员介绍",
    path: "/about/researchers"
  },
  "studies": { 
    ja: "研究活動", 
    en: "Research", 
    zh: "研究活动",
    path: "/studies/projects"
  },
  "studies/projects": { 
    ja: "プロジェクト・研究テーマ", 
    en: "Projects", 
    zh: "项目与研究主题",
    path: "/studies/projects"
  },
  "studies/seminars": { 
    ja: "研究会・セミナー情報", 
    en: "Seminars", 
    zh: "研讨会与讲座",
    path: "/studies/seminars"
  },
  "symposium": { 
    ja: "公開講座・シンポジウム", 
    en: "Symposium", 
    zh: "公开讲座与研讨会",
    path: "/symposium"
  },
  "publications": { 
    ja: "出版物・資料", 
    en: "Publications", 
    zh: "出版物与资料",
    path: "/publications"
  },
  "news": { 
    ja: "ニュース", 
    en: "News", 
    zh: "新闻",
    path: "/news/announcements"
  },
  "news/announcements": { 
    ja: "お知らせ", 
    en: "Announcements", 
    zh: "公告",
    path: "/news/announcements"
  },
  "news/events": { 
    ja: "イベント情報", 
    en: "Events", 
    zh: "活动信息",
    path: "/news/events"
  },
  "contact": { 
    ja: "お問い合わせ", 
    en: "Contact", 
    zh: "联系我们",
    path: "/contact"
  },
  "related-links": { 
    ja: "関連リンク", 
    en: "Related Links", 
    zh: "相关链接",
    path: "/related-links"
  },
};

// 虚拟路径映射：没有实际页面的路径 → 应该导航的实际路径
export const virtualPaths: Record<string, string> = {
  "/news": "/news/announcements", // 新闻页重定向到公告页
  "/about": "/about/overview",    // 关于页重定向到概述页
  "/studies": "/studies/projects" // 研究活动重定向到项目页
};

// 获取所有可搜索的关键词（包括多语言版本）
export const getAllSearchableItems = (language: string = 'zh') => {
  const lang = language.toLowerCase() as 'ja'|'en'|'zh';
  
  return Object.entries(pathMap).map(([key, value]) => ({
    id: key,
    label: value[lang],
    path: value.path
  }));
}; 