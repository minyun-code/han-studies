"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage, LanguageType } from "../contexts/LanguageContext";
import SearchBox from "./SearchBox";

const NAV_ITEMS = [
  {
    title: "研究所について",
    href: "/about",
    subItems: [
      { title: "研究所長挨拶", href: "/about/greeting" },
      { title: "研究所の概要", href: "/about/overview" },
      { title: "研究員紹介", href: "/about/researchers" },
    ],
  },
  {
    title: "研究活動",
    href: "/studies",
    subItems: [
      { title: "プロジェクト・研究テーマ", href: "/studies/projects" },
      { title: "研究会・セミナー情報", href: "/studies/seminars" },
    ],
  },
  { title: "公開講座・シンポジウム", href: "/symposium" },
  { title: "出版物・資料", href: "/publications" },
  {
    title: "ニュース・イベント",
    subItems: [
      { title: "ニュース", href: "/news/announcements" },
      { title: "イベント情報", href: "/news/events" },
    ],
  },
  { title: "お問い合わせ", href: "/contact" },
  { title: "関連リンク", href: "/related-links" },
];

export default function Header() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="w-full bg-black/90 backdrop-blur-xl border-b border-white/10 relative z-[200]">
      {/* 顶部装饰光效 */}
      <motion.div
        className="h-[2px] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />

      {/* 主容器 */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6">
        {/* 第一行：LOGO + 功能区域 */}
        <div className="flex flex-col sm:flex-row items-center justify-between py-3 space-y-3 sm:space-y-0">
          {/* LOGO 优化 */}
          <motion.div whileHover={{ scale: 1.03 }} className="w-full sm:w-auto">
            <Link href="/" className="flex justify-center sm:justify-start">
              <Image
                src="/images/logo.png"
                width={320}
                height={46}
                alt="Waseda University"
                className="w-[280px] sm:w-[280px] hover:drop-shadow-[0_0_12px_rgba(104,117,245,0.3)] transition-all"
                priority
              />
            </Link>
          </motion.div>

          {/* 搜索框和语言切换按钮容器 */}
          <div className="flex flex-col sm:flex-row items-center sm:items-stretch sm:flex-1 sm:justify-between space-y-3 sm:space-y-0 w-full sm:w-auto">
            {/* 搜索框容器 - 在桌面端居中 */}
            <div className="w-full sm:w-auto sm:flex-1 sm:flex sm:justify-center sm:max-w-xl sm:pl-10">
              <SearchBox />
            </div>

            {/* 语言切换按钮 - 在桌面端居右 */}
            <div className="flex space-x-2 sm:ml-4">
              {["JA"].map((lang) => (
                <motion.button
                  key={lang}
                  className={`w-10 h-10 flex items-center justify-center rounded-full
                            ${language === lang
                              ? "bg-gradient-to-br from-blue-400/50 to-purple-400/50 border-blue-300/50"
                              : "bg-gradient-to-br from-white/5 to-white/3 border-white/10"}
                            border shadow-sm hover:shadow-[0_0_12px_2px_rgba(104,117,245,0.2)]`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setLanguage(lang as LanguageType)}
                >
                  <span className={`text-sm font-medium
                                  ${language === lang
                                    ? "text-white"
                                    : "bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent"}`}>
                    {lang}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* 导航菜单 */}
        <nav className="relative">
          <ul className="flex flex-wrap justify-center space-x-4 sm:space-x-8 py-2">
            {NAV_ITEMS.map((item) => (
              <li key={item.title} className="relative group">
                <Link href={item.href || "#"} className="px-2 sm:px-4 py-2 sm:py-2.5 flex items-center justify-end">
                  <motion.span
                    className="text-xs sm:text-sm font-medium text-gray-300 hover:text-white transition-colors"
                    whileHover={{ y: -2 }}
                  >
                    {t(item.title)}
                  </motion.span>
                </Link>

                {/* 下拉菜单 */}
                {item.subItems && (
                  <motion.div
                    className="absolute left-0 top-full mt-2 w-48 bg-black/90 backdrop-blur-lg rounded-lg shadow-lg
                              invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 z-[100]"
                    initial={{ y: 10 }}
                    animate={{ y: 0 }}
                  >
                    {item.subItems.map((subItem) => (
                      <Link key={subItem.title} href={subItem.href} className="block px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-all">
                        {t(subItem.title)}
                      </Link>
                    ))}
                  </motion.div>
                )}

                {/* 悬浮粒子效果 */}
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-purple-400 rounded-full"
                      initial={{ scale: 0 }}
                      animate={{
                        scale: [0, 1, 0],
                        x: Math.random() * 40 - 20,
                        y: Math.random() * -30
                      }}
                      transition={{
                        duration: 0.8,
                        delay: i * 0.1,
                        repeat: Infinity
                      }}
                    />
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}