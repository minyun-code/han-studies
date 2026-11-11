"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AboutMain() {
  return (
    <div className="relative min-h-screen p-6 bg-transparent">
      {/* 标题部分 */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 10 }}
        className="mb-12 text-center"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-b  from-gray-900 via-gray-700 to-gray-500 bg-clip-text text-transparent font-serif mb-3">
          研究所について
        </h1>
        <div className="h-[1.5px] w-28 mx-auto bg-gradient-to-r from-transparent via-[#4A4A4A] to-transparent" />
      </motion.div>

      {/* 导航网格 */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { href: "/about/greeting", title: "研究所長挨拶" },
          { href: "/about/overview", title: "研究所概要" },
          { href: "/about/researchers", title: "研究員紹介" },
        ].map((item, index) => (
          <motion.div
            key={item.href}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 150, damping: 12, delay: index * 0.1 + 0.2 }}
          >
            <Link href={item.href} className="group">
              <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/30 backdrop-blur-xl transition-all duration-500 cursor-pointer group-hover:shadow-xl group-hover:scale-[1.015]">
                {/* 水墨晕开 hover 效果 */}
                <div className="absolute inset-0 group-hover:bg-gradient-to-b from-white/10 to-transparent group-hover:blur-sm transition-all duration-500" />

                {/* 内容容器 */}
                <div className="relative flex items-center justify-center p-4 h-32 md:h-40">
                  {/* 书法文字 */}
                  <h2 className="text-2xl font-bold bg-gradient-to-b  from-gray-900 via-gray-700 to-gray-500 bg-clip-text text-transparent font-calligraphy tracking-wide">
                    {item.title}
                  </h2>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* 背景装饰元素 */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        {/* 柔光晕 */}
        <div className="absolute right-16 top-32 w-36 h-36 bg-[#3A3A3A]/5 blur-2xl rounded-full opacity-40"></div>
        <div className="absolute left-24 bottom-24 w-48 h-48 bg-[#3A3A3A]/5 blur-2xl rounded-full opacity-20"></div>
      </div>
    </div>
  );
}
