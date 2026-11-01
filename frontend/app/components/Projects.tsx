import Link from "next/link";
import ScrollReveal from "./ScrollReveal";
import Image from "next/image";

// 项目数据结构
interface Project {
  id: number;
  title: string;
  slug: string;
  description?: string;
  coverUrl?: string;
}

const API_BASE_URL = "http://127.0.0.1:1337";

// 获取项目数据
async function getProjects(): Promise<Project[]> {
  const res = await fetch(`${API_BASE_URL}/api/projects?populate=cover`, {
    cache: "force-cache",
  });
  const data = await res.json();

  return data.data.map((item: any) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    description: item.description,
    coverUrl: item.cover?.formats?.medium?.url
      ? `${item.cover.formats.medium.url}`
      : item.cover?.url
      ? `${item.cover.url}`
      : undefined,
  }));
}

export default async function Projects() {
  const projects = await getProjects();

  return (
    <ScrollReveal>
      <section className="min-h-screen relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-24 relative z-10">
          {/* 标题区 - 使用图片替代文字 */}
          <div className="mb-24 text-center">
            <div className="flex justify-center">
              <Image 
                src="/images/title-projects.png" 
                alt="プロジェクト・研究テーマ" 
                width={400} 
                height={100} 
                className="h-auto"
              />
            </div>
          </div>

          {/* 列表区 */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="relative group block h-full rounded-[2rem] overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-200"
              >
                <Link href={`/studies/projects/${project.slug}`}>
                  {/* 图片区 */}
                  <div className="relative h-72 overflow-hidden">
                    {project.coverUrl ? (
                      <img
                        src={project.coverUrl}
                        alt={project.title}
                        className="object-cover transition-transform duration-700 group-hover:scale-105 group-hover:rotate-1"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500">
                        イメージなし
                      </div>
                    )}
                  </div>

                  {/* 文本区 */}
                  <div className="p-8 flex flex-col space-y-3">
                    <h3 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 leading-tight tracking-wide">
                      {project.title}
                    </h3>
                    <div className="w-12 h-1 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 rounded-full" />
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                      {project.description || "探索未知的学术领域"}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* 查看更多按钮 */}
          <div className="mt-16 text-center">
            <Link
              href="/studies/projects"
              className="group relative inline-flex items-center px-8 py-4 space-x-3 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 text-white rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <span>もっと見る</span>
              <svg
                className="w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:rotate-15"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
