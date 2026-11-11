"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState } from "react";

const navItems = [
  { href: "/about", label: "研究所について" },
  { href: "/about/greeting", label: "研究所長挨拶" },
  { href: "/about/overview", label: "研究所概要" },
  { href: "/about/researchers", label: "研究員紹介" },
];

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname().replace(/\/+$/, "") || "/";
  const [navPositions, setNavPositions] = useState<{ [key: string]: number }>({});
  const navRefs = useRef<{ [key: string]: HTMLLIElement | null }>({});

  // 更新导航项位置
  useEffect(() => {
    const updatePositions = () => {
      const positions: { [key: string]: number } = {};
      navItems.forEach(({ href }) => {
        const element = navRefs.current[href];
        if (element) {
          positions[href] = element.offsetTop;
        }
      });
      setNavPositions(positions);
    };

    updatePositions();
    window.addEventListener('resize', updatePositions);
    return () => window.removeEventListener('resize', updatePositions);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-transparent">
      {/* 移动端顶部导航 / 桌面端侧边栏 */}
      <aside className="w-full lg:w-72 p-4 lg:p-6 lg:m-4
        bg-white/5
        backdrop-blur-3xl backdrop-brightness-125 backdrop-saturate-150 backdrop-contrast-150 backdrop-opacity-70
        rounded-none lg:rounded-3xl shadow-white/30 hover:shadow-2xl
        border-b lg:border border-white/10
        transition-all duration-300 relative overflow-hidden
        sticky top-0 z-50 lg:static">

        <nav>
          <ul className="flex lg:flex-col lg:space-y-1 space-x-2 lg:space-x-0 overflow-x-auto lg:overflow-visible">
            <AnimatePresence mode="wait">
              {navItems.map(({ href }) =>
                pathname === href ? (
                  <motion.div
                    key={`desktop-${href}`}
                    layoutId="desktop-highlight"
                    className="hidden lg:block absolute left-2 right-2 h-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 z-0 rounded-xl"
                    style={{
                      top: `${navPositions[href] || 0}px`,
                    }}
                    initial={{ opacity: 0, scaleX: 0.9 }}
                    animate={{
                      opacity: 1,
                      scaleX: 1,
                      transition: { duration: 0.3, delay: 0.05 }
                    }}
                    exit={{ opacity: 0, scaleX: 0.9 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                      mass: 0.5
                    }}
                  />
                ) : null
              )}
            </AnimatePresence>

            {navItems.map(({ href, label }) => (
              <motion.li
                key={href}
                ref={(el: HTMLLIElement | null) => {
                  navRefs.current[href] = el;
                }}
                className="relative z-10 flex-shrink-0"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Link
                  href={href}
                  className={`flex items-center px-3 lg:px-4 py-2 lg:py-3 h-10 lg:h-12 rounded-lg lg:rounded-xl transition-all duration-300 group whitespace-nowrap
                    ${
                      pathname === href
                        ? "text-slate-800 font-semibold bg-white/40 shadow-inner"
                        : "text-slate-600 hover:bg-white/30 hover:shadow-sm"
                    }`}
                >
                  {/* Animated bullet */}
                  <motion.div
                    className={`w-2 h-2 rounded-full mr-2 lg:mr-3 ${
                      pathname === href
                        ? "bg-blue-500"
                        : "bg-slate-400/50 group-hover:bg-blue-400"
                    }`}
                    animate={{
                      scale: pathname === href ? 1.2 : 1,
                      x: pathname === href ? 0 : -2
                    }}
                  />
                  <span className="relative text-sm lg:text-base">
                    {label}
                    {/* Underline animation */}
                    {pathname === href && (
                      <motion.div
                        className="absolute -bottom-1 left-0 w-full h-[2px] bg-blue-500"
                        layoutId="underline"
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6
                        }}
                      />
                    )}
                  </span>
                </Link>
              </motion.li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 lg:p-8 lg:pr-12">{children}</main>
    </div>
  );
}
