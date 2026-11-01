import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

interface Announcements {
  id: number;
  title: string;
  slug: string;
  publishDate?: string;
}

const API_BASE_URL = "http://127.0.0.1:1337";

// 获取公告数据
async function getAnnouncements(): Promise<Announcements[]> {
  const res = await fetch(`${API_BASE_URL}/api/announcements?populate=*`);
  const data = await res.json();

  return data.data.map((item: any) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    publishDate: item.publishDate,
  }));
}

export default async function AnnouncementsPage() {
  const announcements = await getAnnouncements();

  return (
    <div className="min-h-screen py-16 px-4 bg-transparent">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* 标题 */}
        <h1 className="text-5xl font-serif text-center mb-16 text-gray-800 relative">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">
            ニュース
          </span>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-gray-400 to-transparent opacity-50" />
        </h1>

        {/* 公告列表 */}
        <ul className="space-y-8 relative z-10">
          {announcements.reverse().map((a) => {
            const dateObj = a.publishDate ? new Date(a.publishDate) : new Date();
            const day = dateObj.getDate().toString().padStart(2, "0");
            const yearMonth = `${dateObj.getFullYear()}.${(dateObj.getMonth() + 1)
              .toString()
              .padStart(2, "0")}`;

            return (
              <li
                key={a.id}
                className="group relative overflow-hidden transition-all duration-500 hover:bg-white/30 backdrop-blur-sm rounded-xl p-6 hover:shadow-ink"
              >
                {/* 水墨装饰线 */}
                <div className="absolute left-0 bottom-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-start gap-6">
                  {/* 日期印章 */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-red-500/10 rounded-full blur-sm" />
                    <div className="relative z-10 text-2xl font-bold text-gray-600 min-w-[60px] text-center leading-none p-3 border-2 border-red-600/30 rounded-full">
                      {day}
                      <div className="text-xs font-normal text-gray-500 mt-1">{yearMonth}</div>
                    </div>
                  </div>

                  {/* 标题 */}
                  <Link
                    href={`/news/announcements/${a.slug}`}
                    className="flex-1 text-lg leading-snug transition-all duration-300 hover:pl-4"
                  >
                    <span className="text-gray-800 hover:text-blue-700 relative before:absolute before:bottom-0 before:left-0 before:w-0 before:h-px before:bg-purple-600 hover:before:w-full before:transition-all before:duration-700">
                      {a.title}
                    </span>
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );


}