import Link from "next/link";
import ScrollReveal from "./ScrollReveal";
import Image from "next/image";

interface Publication {
  id: number;
  title: string;
  slug: string;
  detailLink: string;
  description?: string;
  coverUrl?: string;
}

const API_BASE_URL = "http://127.0.0.1:1337";

// 获取出版物数据
async function getPublications(): Promise<Publication[]> {
  const res = await fetch(`${API_BASE_URL}/api/publications?populate=*&pagination[pageSize]=3`, {
    cache: "force-cache",
  });
  const data = await res.json();
  return data.data.map((item: any) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    description: item.description,
    detailLink: item.detailLink || `/publications/${item.slug}`,
    coverUrl: item.coverImage?.[0]?.url ? `${item.coverImage[0].url}` : undefined,
  }));
}

export default async function PublicationsPreview() {
  const publications = await getPublications();

  return (
    <ScrollReveal>
      <section className="min-h-screen relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-24 relative z-10">
          {/* 标题部分 - 使用图片替代文字 */}
          <div className="mb-24 text-center">
            <div className="flex justify-center">
              <Image
                src="/images/title-publications.png"
                alt="出版物・資料"
                width={320}
                height={90}
                className="h-auto"
              />
            </div>
          </div>

          {/* 列表区 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {publications.map((pub) => (
              <div
                key={pub.id}
                className="relative group rounded-xl overflow-hidden bg-white shadow-xl hover:shadow-2xl transition-shadow"
              >
                {/* 图片区 */}
                <div className="relative overflow-hidden bg-gray-50">
                  {pub.coverUrl ? (
                    <img
                      src={pub.coverUrl}
                      alt={pub.title}
                      className="w-full h-auto object-contain"
                    />
                  ) : (
                    <div className="h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                      <span className="text-gray-400 italic">No Image</span>
                    </div>
                  )}
                </div>

                {/* 内容区 */}
                <div className="p-4">
                  {/* 标题区 */}
                  <h3 className="text-base font-bold font-serif text-gray-800 leading-snug mb-4">
                    {pub.title}
                  </h3>

                  {/* 查看更多按钮 */}
                  <div>
                    <Link
                      href={'/publications'}
                      className="w-full px-4 py-2.5 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 text-white rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center space-x-2"
                    >
                      <span>詳細を見る</span>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
