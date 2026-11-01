import Link from "next/link";
import ScrollReveal from "./ScrollReveal";
import Image from "next/image";

interface Announcement {
  id: number;
  title: string;
  slug: string;
  publishDate?: string;
}

const API_BASE_URL = "http://127.0.0.1:1337";

// 获取公告数据
async function getAnnouncements(): Promise<Announcement[]> {
  const res = await fetch(`${API_BASE_URL}/api/announcements?populate=*`, {
    cache: "force-cache", // 强制静态缓存，避免无限请求
  });
  const data = await res.json();
  return data.data.slice(0, 5).map((item: any) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    publishDate: item.publishDate,
  }));
}

export default async function NewsSummary() {
  const announcements = await getAnnouncements();

  return (
    <ScrollReveal>
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 标题部分使用图片替代文字 */}
          <div className="mb-14 text-center space-y-4">
            <div className="flex justify-center">
              <Image
                src="/images/title-news.png"
                alt="ニュース"
                width={240}
                height={80}
                className="h-auto"
              />
            </div>
            <div className="w-24 h-1.5 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 mx-auto rounded-full" />
          </div>

          {/* 新闻列表现代卡片式设计 */}
          <div className="grid gap-8 lg:grid-cols-1">
            {announcements.reverse().map((item) => (
              <article
                key={item.id}
                className="group relative p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                  {/* 日期标签设计 */}
                  {item.publishDate && (
                    <time className="mb-3 sm:mb-0 px-4 py-2 bg-blue-50 text-gray-900 rounded-full text-sm font-medium">
                      {new Date(item.publishDate).toLocaleDateString("ja-JP")}
                    </time>
                  )}

                  {/* 标题动态效果 */}
                  <Link
                    href={`/news/announcements/${item.slug}`}
                    className="flex-1 sm:pl-8 hover:translate-x-2 transition-transform duration-200"
                  >
                    <h3 className="text-2xl font-semibold text-gray-800 leading-snug">
                      {item.title}
                      <span className="ml-3 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        ↗
                      </span>
                    </h3>
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* 查看更多按钮现代设计 */}
          <div className="mt-12 flex justify-center">
            <Link
              href="/news/announcements"
              className="flex items-center px-8 py-3.5 border border-transparent text-base font-medium rounded-full text-white bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 hover:from-gray-700 hover:to-gray-500 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              <span>すべてのニュースを見る</span>
              <svg
                className="ml-2 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
