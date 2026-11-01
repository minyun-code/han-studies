import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Project {
  id: number;
  title: string;
  description?: string;
  coverUrl?: string;
  content?: string;
}

const API_BASE_URL = "http://127.0.0.1:1337";

// 获取单个项目数据
async function getProject(slug: string): Promise<Project | null> {
  const res = await fetch(`${API_BASE_URL}/api/projects?filters[slug][$eq]=${slug}&populate=*`);
  const { data } = await res.json();

  if (data.length === 0) return null;

  const item = data[0];
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    content: item.content,
    coverUrl: item.cover?.formats?.large?.url
      ? `${item.cover.formats.large.url}`
      : item.cover?.url
      ? `${item.cover.url}`
      : undefined,
  };
}

// 动态路径生成
export async function generateStaticParams() {
  const slugs = ["valuing-air-project", "ushita-arts-initiative",'project-1','project-2']; // 动态路由参数
  return slugs.map((slug) => ({ slug }));
}

export default async function ProjectDetailPage({ params }: { params: { slug: string } }) {
  const project = await getProject(params.slug);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">プロジェクトが見つかりません。</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* 返回按钮 */}
        <Link
          href="/studies/projects"
          className="group inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 mb-8"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
          <span className="text-sm font-medium">戻る</span>
        </Link>

        {/* 标题区域 */}
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            {project.title}
          </h1>

          {/* 封面图片 */}
          {project.coverUrl && (
            <div className="relative w-full aspect-[16/9] mb-8 overflow-hidden rounded-xl shadow-lg">
              <img
                src={project.coverUrl}
                alt={project.title}
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
              />
            </div>
          )}

          {/* 描述 */}
          {project.description && (
            <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
              {project.description}
            </p>
          )}

          {/* 内容 */}
          {project.content && (
            <div className="prose prose-lg max-w-none bg-white p-6 rounded-xl shadow-sm">
              <div className="text-gray-700 leading-relaxed">
                {project.content}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
