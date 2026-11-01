"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function GreetingPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
      className="max-w-7xl w-full mx-auto py-12 px-6 bg-white/60 backdrop-blur-lg shadow-lg rounded-2xl"
    >
      {/* 标题 */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="text-4xl font-extrabold text-center text-gray-900 mb-10"
      >
        研究所長挨拶
      </motion.h1>

      {/* 所長写真+名前 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="flex flex-col items-center mb-12"
      >
        <div className="relative w-48 h-64">
          <Image
            src="/images/watanabe.jpg"
            alt="研究所長"
            layout="fill"
            objectFit="cover"
            className="rounded-lg shadow-md border border-gray-300"
          />
        </div>
        <p className="text-lg font-semibold text-gray-800 mt-4 border-t-2 border-gray-300 pt-2">
          早稲田大学漢学研究所所長　渡邉 義浩
        </p>
      </motion.div>

      {/* 文章内容 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="text-gray-700 leading-relaxed text-[17px] font-light space-y-8 px-2"
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="indent-8"
        >
          早稲田大学は、建学の精神を定めた「早稲田大学教旨」の執筆に尽力した松平康国をはじめとする多くの漢学者を輩出しています。
          それらのなかでも、一九〇五年に成立した清国留学生部で日本語を教えた津田左右吉は、
          『古事記及び日本書紀の研究』、『神代史の研究』により、
          記紀神話とそれに続く神武天皇以下の記述に史料批判を加えたほか、
          早稲田大学の東洋哲学研究の基本を定めました。
        </motion.p>

        <motion.p
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="indent-8"
        >
          本研究所は、津田左右吉記念室（早稲田大学２号館・会津博物館２階）
          に事務所を置き、津田の学問を継承すると共に、国際漢学研究の推進と漢学研究者の育成を行うほか、
          早稲田大学の近代における中国との関わりを解明していきます。
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="indent-8"
        >
          漢文不要論が唱えられ、国立大学における漢学教員が減少していく中で、
津田左右吉に代表される早稲田漢学の伝統を継承し、未来に引き継いでいくことを目指していきます。
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
