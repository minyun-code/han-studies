"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="w-screen bg-black text-white py-4">
      <div className="max-w-5xl mx-auto px-6">

        {/* 🔹 三列布局：安全、网站、联系 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 text-center md:text-left mb-12">
          {/* 🔹 第一列 */}
          <div>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:text-gray-300 transition">About the Institute</Link></li>
              <li><Link href="/studies" className="hover:text-gray-300 transition">Research Activities</Link></li>
              <li><Link href="/symposium" className="hover:text-gray-300 transition">Public Lectures & Symposiums</Link></li>
            </ul>
          </div>

          {/* 🔹 第二列 */}
          <div>
            <ul className="space-y-2">
              <li><Link href="/publications" className="hover:text-gray-300 transition">Publications & Resources</Link></li>
              <li><Link href="/news/announcements" className="hover:text-gray-300 transition">News & Events</Link></li>
            </ul>
          </div>

          {/* 🔹 第三列 */}
          <div>
            <ul className="space-y-2">
              <li><Link href="/contact" className="hover:text-gray-300 transition">Contact Us</Link></li>
              <li><Link href="/related-links" className="hover:text-gray-300 transition">Related Links</Link></li>
            </ul>
          </div>
        </div>

        {/* 🔹 LOGO + 社交媒体 */}
        <div className="flex flex-col items-center mb-8">
          {/* 🔹 LOGO 动画 */}
          <motion.div whileHover={{ scale: 1.1 }} className="flex justify-center">
  <Image
           src="/images/logo.png"
           width={320}
           height={50}
           alt="Waseda University Institute of Han Studies"
    className="object-contain"
  />
</motion.div>


        </div>

        {/* 🔹 版权信息 */}
        <div className="text-center text-sm text-gray-400">
        © Waseda University Institute of Han Studies. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
