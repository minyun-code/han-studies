"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function OverviewPage() {
  const [activeTab, setActiveTab] = useState<"gaiyo" | "enkaku" | "video">(
    "gaiyo"
  );

  return (
    <div
      className="min-h-screen
    bg-white/10        /* 半透明白，留点颜色才能显出毛玻璃 */
    backdrop-blur-2xl  /* 毛玻璃模糊程度 */
    backdrop-saturate-150  /* 让背景更鲜艳，对比更强 */
     border border-gray-200
     rounded-xl
    p-8
  "
    >
      <div className="max-w-6xl mx-auto">
        {/* 标题部分 */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-bold text-slate-800 mb-8 text-center bg-clip-text bg-gradient-to-r from-blue-600 to-purple-500"
        >
          研究所の概要
        </motion.h1>

        {/* 现代风格 Tab 导航 */}
        <div className="flex mb-8 space-x-2 border-b border-slate-200 relative">
          {[
            { id: "gaiyo", label: "概要" },
            { id: "enkaku", label: "沿革" },
            // { id: "video", label: "映像" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative px-6 py-3 text-sm font-medium transition-colors
                ${
                  activeTab === tab.id
                    ? "text-blue-600 font-semibold"
                    : "text-slate-500 hover:text-slate-700"
                }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="tabHighlight"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* 内容区域：去掉大白背景，保留动画与内边距 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="p-4"
          >
            {activeTab === "gaiyo" && <GaiyoTab />}
            {activeTab === "enkaku" && <EnkakuTab />}
            {activeTab === "video" && <VideoTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/** 1. 「概要」Tab - 简洁布局，去掉多余白框 */
function GaiyoTab() {
  return (
    <div className="text-slate-700 leading-relaxed space-y-6 text-base text-justify">
      <p>
        早稲田大学漢学研究所は、 2024年9月21日、北京大学の協力のもと、国際的な漢学研究、漢学研究者の育成を主要な事業として、歴史館のプロジェクトとして設置されました。本学が所有する他の博物館など、 関連する諸機関と連携して、本学が持つ文化事業も加味させた、 新たな事業展開を推進するためです。将来的には人文・社会科学分野における新しい教育研究拠点になることを目指しています。
      </p>

      <p>
        除幕式では、田中愛治総長が、「早稲田大学と北京大学は、1982年に学術交流協定を締結して以来、42年にわたり様々な共同教育プログラムや共同研究を実施し、両国の学術交流の発展に貢献してまいりました。この長きにわたる両大学の連携によって生まれた成果を鑑み、歴代の総長・学長の賢明な判断と関係者の皆様のご尽力に対して、深く感謝いたします。今後も両大学が協力し、人的資源や知的財産を共有しながら、漢学研究所の発展に向けて共に歩むことを合意できたことは、たいへん喜ばしいことです。両国を代表する大学が、手を携えて築き上げるこの研究所は、国際的な漢学研究の拠点となり、次世代の漢学研究者の育成に、大きく寄与すると確信しております」と挨拶しました。
      </p>

      <p>
        除幕に先立ち、
          「早稲田大学漢学研究所共同協力体制に関する意向書」を 早稲田大学と北京大学とで締結し、 調印式が執り行われました。両大学は、これまでの友好なパートナーシップを一層強化し、より広い分野における学術交流を展開するため、国際漢学研究を推進する、漢学研究者を育成する、その他関連する学術交流および協力事業を展開することについて、合意いたしました。
      </p>

      <p>
        除幕式には、田中愛治総長、北京大学の龔旗煌学長のほか、宮本雄二公益財団法人日中友好会館会長（元駐中国大使）、魏宏名康師傅控股有限公司董事長（北京大学名誉校董・早稲田大学名誉校董）、郭軍中国大使館教育部参事官をはじめ、 学内外の関係者が多数参列しました。
      </p>
    </div>
  );
}

function EnkakuTab() {
  const timeline = [
    { year: 2024, date: "9月21日", event: "研究所設立", highlight: true },
    { year: "", event: "今後の更なる研究展開と学際的連携の深化に向けて始動" },
    /* { year: 2000, event: "大規模研究プロジェクト始動" },
    { year: 2020, event: "AI技術新領域開拓", highlight: true },*/
  ];

  return (
    <div className="relative pl-8">
      {/* 动态时间轴线 */}
      <div className="absolute left-0 top-0 w-1 h-full overflow-hidden rounded-full">
        <motion.div
          className="w-full h-full bg-gradient-to-b from-[#8B1A1A] to-[#a32424]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* 流光效果 */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-blue-400/30 to-transparent"
            animate={{
              y: ["0%", "100%", "0%"],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </motion.div>
      </div>

      {timeline.map((item, idx) => (
        <motion.div
          key={item.year}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{
            delay: idx * 0.1,
            type: "spring",
            stiffness: 120,
            damping: 12,
          }}
          className="relative mb-8 pl-6 group"
        >
          {/* 时间点粒子效果 */}
          <motion.div
            className="absolute left-[-28px] top-1 w-4 h-4 rounded-full border-4 border-white shadow-lg z-10"
            style={{
              background: item.highlight
                ? "radial-gradient(circle, #3b82f6, #6366f1)"
                : "#fff",
            }}
            whileHover={{ scale: 1.2 }}
          >
            {/* 高光粒子 */}
            {item.highlight && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-full bg-white/30"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full"
                    initial={{
                      opacity: 0,
                      x: 0,
                      y: 0,
                    }}
                    animate={{
                      opacity: [1, 0],
                      x: Math.cos((i * 120 * Math.PI) / 180) * 20,
                      y: Math.sin((i * 120 * Math.PI) / 180) * 20,
                    }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.1,
                      repeat: Infinity,
                    }}
                  />
                ))}
              </>
            )}
          </motion.div>

          {/* 时间卡片 */}
          <motion.div
            className={`p-6 rounded-xl relative overflow-hidden ${
              item.highlight
                ? "bg-gradient-to-r from-blue-50/80 to-purple-50/80 shadow-lg"
                : "bg-white/40 backdrop-blur-sm"
            }`}
            whileHover={{
              y: -5,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
          >
            {/* 动态流光背景 */}
            {item.highlight && (
              <motion.div
                className="absolute inset-0 overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/* 传统云纹流光 */}
                <motion.div
                  className="absolute inset-0 bg-[url('/images/xiangyun.svg')] bg-repeat opacity-50"
                  animate={{ backgroundPositionX: ["0%", "100%"] }}
                  transition={{
                    duration: 30, // 平缓、耐看
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />

                {/* 渐变遮罩 */}
                <div className="absolute inset-0 bg-gradient-to-r from-silk-gold/30 via-transparent to-cinnabar-red/30" />
              </motion.div>
            )}

            {/* 内容 */}
            {item.year && (
              <h3 className="text-lg font-semibold text-slate-800 mb-2 relative z-10">
                {item.year}年
                {item.date && (
                  <span className="ml-1 text-sm text-slate-500">
                    {item.date}
                  </span>
                )}
                {item.highlight && (
                  <motion.span
                    className="ml-2 text-yellow-500"
                    animate={{ opacity: [1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    ✨
                  </motion.span>
                )}
              </h3>
            )}

            <motion.p
              className="text-slate-600 relative z-10"
              initial={{ clipPath: "inset(0 100% 0 0)" }}
              whileInView={{ clipPath: "inset(0 0% 0 0)" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {item.event}
            </motion.p>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

/** 3. 「映像」Tab - 多媒体展示 */
function VideoTab() {
  return (
    <div className="space-y-8">
      {/* 视频展示容器 - 除幕式記録映像 */}

      {/* 新增视频展示容器 - 除幕式の記念映像 */}
      <motion.div
        className="group relative rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500"
        whileHover="hover"
        initial="rest"
        variants={{
          rest: { scale: 1 },
          hover: { scale: 1.02 },
        }}
      >
        {/* 动态标题栏 */}
        <div className="relative bg-gradient-to-r from-[#2a4d6e] to-[#3a5a7a] p-6">
          {/* 标题背景纹理 */}
          <div className="absolute inset-0 opacity-30 bg-[url('/images/qinghua.svg')] mix-blend-overlay" />

          {/* 动态光晕效果 */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-[#c2a562]/30 via-transparent to-[#c2a562]/30"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%"],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          <h3 className="text-2xl font-bold text-[#f5f5f5] relative z-10 flex items-center">
            <span className="mr-3 text-[#c2a562]">🎞</span>
            除幕式の記念映像
          </h3>
        </div>

        {/* 视频容器 - 增强版 */}
        <div className="relative aspect-w-16 aspect-h-9 bg-[#1a2d3d]">
          {/* 加载骨架屏 */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#2a4d6e]/50 to-[#3a5a7a]/50 animate-pulse" />

          {/* 边框装饰 */}
          <div className="absolute inset-0 border-2 border-[#c2a562]/20 rounded-b-3xl pointer-events-none" />

          {/* 本地 mp4 视频 */}
          <video
            src="/images/除幕式の記念映像.mp4"
            className="w-full h-full object-cover rounded-b-3xl backdrop-blur-sm"
            controls
            loop
            muted
            playsInline
            style={{
              maskImage:
                "linear-gradient(to bottom, black 80%, transparent 98%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, black 80%, transparent 98%)",
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
