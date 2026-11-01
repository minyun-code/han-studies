import Link from "next/link";

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

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100">プロジェクト・研究テーマ一覧</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.reverse().map((project) => (
          <Link
            key={project.id}
            href={`/studies/projects/${project.slug}`}
            className="group block border rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white dark:bg-gray-800 relative transform hover:-translate-y-1.5"
          >
            {/* 封面图片 */}
            <div className="relative aspect-video bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-900 overflow-hidden">
              {project.coverUrl ? (
                <img
                  src={project.coverUrl}
                  alt={project.title}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover w-full h-full transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700">
                  <span className="text-gray-500">画像なし</span>
                </div>
              )}
            </div>

            {/* 项目标题 */}
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{project.title}</h2>
              <svg
                className="w-5 h-5 text-blue-500 dark:text-blue-400 ml-2 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>

            {/* 简介 */}
            <p className="text-gray-600 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {project.description && project.description.length > 80
                ? project.description.slice(0, 80) + "..."
                : project.description || "説明文がありません"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
