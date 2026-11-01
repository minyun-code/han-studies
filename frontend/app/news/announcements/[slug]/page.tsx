import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import React from "react";

interface Announcement {
  id: number;
  title: string;
  slug: string;
  content?: string;
  publishDate?: string;
  imageUrl?: string | null;
  imageCaption?: string | null;
}

const API_BASE_URL = "http://127.0.0.1:1337";

// 动态路径生成 - 增强版，从API获取所有公告的slug
export async function generateStaticParams() {
  try {
    // 获取所有公告数据用于生成静态路径
    const res = await fetch(`${API_BASE_URL}/api/announcements?fields=slug`, {
      cache: "force-cache"
    });
    const data = await res.json();
    if (!data.data || !Array.isArray(data.data)) {
      console.warn("无法获取公告数据用于generateStaticParams, 使用默认值");
      return [{ slug: "announcement-1" }, { slug: "announcement" }];
    }

    // 从API数据中提取所有slug
    return data.data
      .filter((item: any) => item.slug)
      .map((item: any) => ({
        slug: item.slug
      }));
  } catch (error) {
    console.error("获取静态路径参数失败:", error);
    // 出错时返回默认值，避免构建失败
    return [{ slug: "announcement-1" }, { slug: "announcement" }];
  }
}

// 获取公告数据 - 优化缓存配置
async function getAnnouncement(slug: string): Promise<Announcement | null> {
  try {
    // 使用force-cache确保在构建时获取数据并缓存
    const res = await fetch(`${API_BASE_URL}/api/announcements?filters[slug][$eq]=${slug}&populate=*`, {
      cache: "force-cache",
      next: { revalidate: 3600 } // 可选: 每小时重新验证一次数据
    });

    if (!res.ok) {
      console.error(`获取公告详情失败: ${res.status} ${res.statusText}`);
      return null;
    }

    const data = await res.json();
    // 安全检查，确保有数据返回
    if (!data || !data.data || !data.data[0]) {
      console.warn(`找不到slug为"${slug}"的公告`);
      return null;
    }

    const item = data.data[0];

    return {
      id: item.id,
      title: item.title || "无标题公告",
      slug: item.slug,
      content: item.content || "",
      publishDate: item.publishDate,
      imageUrl: item.image?.[0]?.formats?.medium?.url
        ? `${item.image[0].formats.medium.url}`
        : null,
      imageCaption: item.imageCaption || null,
    };
  } catch (error) {
    console.error("获取公告详情失败:", error);
    return null;
  }
}

// 改进参数处理，优化SSG支持
export default async function AnnouncementDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  // 从props中获取参数
  const { slug } = await props.params;

  const announcement = await getAnnouncement(slug);

  // 处理找不到数据的情况
  if (!announcement) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-800 gap-4">
        <h1 className="text-3xl font-bold">お知らせが見つかりません</h1>
        <p className="text-gray-600">指定されたお知らせは存在しないか、削除された可能性があります。</p>
        <Link
          href="/news/announcements"
          className="mt-4 px-6 py-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
        >
          ニュース一覧に戻る
        </Link>
      </div>
    );
  }

  const formattedDate = announcement.publishDate
    ? new Date(announcement.publishDate).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    : "";

  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    announcement.title
  )}&url=${encodeURIComponent(`www.waseda-hanstudies.jp/news/announcements/${announcement.slug}`)}`;

  // 自定义ReactMarkdown渲染组件
  const customRenderers = {
    h1: (props: any) => <h1 className="text-2xl font-bold text-gray-800 mt-8 mb-4 pb-2 border-b border-gray-200" {...props} />,
    h2: (props: any) => <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3 pb-1 border-b border-gray-100" {...props} />,
    h3: (props: any) => <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-2" {...props} />,
    h4: (props: any) => <h4 className="text-base font-semibold text-gray-700 mt-3 mb-2" {...props} />,
    h5: (props: any) => <h5 className="text-sm font-semibold text-gray-700 mt-2 mb-1" {...props} />,
    // 特殊处理h6，用于图片说明
    h6: (props: any) => (
      <figcaption className="text-sm text-gray-500 text-center mt-2 italic max-w-[90%] mb-6">
        {props.children}
      </figcaption>
    ),
    p: (props: any) => {
      // 检查段落是否只包含图片
      const childrenArray = React.Children.toArray(props.children);
      if (
        childrenArray.length === 1 &&
        React.isValidElement(childrenArray[0]) &&
        childrenArray[0].type === "img"
      ) {
        return (
          <figure className="my-8 flex flex-col items-center">
            {childrenArray}
          </figure>
        );
      }
      return <p className="my-4 text-base leading-relaxed text-gray-700" {...props} />;
    },
    img: (props: any) => {
      // 去除本地 API 前缀
      const imgSrc = props.src?.replace(/^https?:\/\/(localhost|127\.0\.0\.1):1337/, '') || '';
      return (
        <img
          src={imgSrc}
          alt={props.alt || ""}
          className="rounded-lg shadow-md max-w-full object-contain w-auto max-h-[420px] mx-auto"
        />
      );
    },
    ul: (props: any) => <ul className="list-disc pl-6 my-4 space-y-2" {...props} />,
    ol: (props: any) => <ol className="list-decimal pl-6 my-4 space-y-2" {...props} />,
    li: (props: any) => <li className="text-base text-gray-700" {...props} />,
    blockquote: (props: any) => (
      <blockquote className="pl-4 italic border-l-4 border-gray-300 my-4 text-gray-600" {...props} />
    ),
    a: (props: any) => (
      <a className="text-blue-600 hover:text-blue-800 hover:underline transition-colors" {...props} />
    ),
  };

  return (
    <div className="min-h-screen px-4 py-16 bg-white/5 backdrop-blur-md shadow-xl rounded-xl">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-10">
          {/* 返回按钮 */}
          <Link
            href="/news/announcements"
            className="group inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 mb-8"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="text-sm font-medium">戻る</span>
          </Link>

          <p className="text-sm text-gray-500 mb-2 tracking-wide">{formattedDate}</p>
          <h1 className="text-3xl md:text-4xl font-serif font-extrabold text-gray-900 leading-tight tracking-normal">
            {announcement.title}
          </h1>
        </div>

        {/* Image 带说明文字 */}
        {announcement.imageUrl && (
          <figure className="my-8 flex flex-col items-center">
            <img
              src={announcement.imageUrl}
              alt={announcement.title}
              className="rounded-lg shadow-md object-contain w-auto max-w-[90%] max-h-[400px]"
            />
            {announcement.imageCaption && (
              <figcaption className="text-sm text-gray-500 text-center mt-2 italic max-w-[90%]">
                {announcement.imageCaption}
              </figcaption>
            )}
          </figure>
        )}

        {/* Content 使用自定义渲染 */}
        <article className="prose prose-lg max-w-none bg-white/80 backdrop-blur-sm rounded-xl p-9 shadow-ink hover:shadow-2xl transition-all">
          <ReactMarkdown components={customRenderers}>
            {announcement.content || ""}
          </ReactMarkdown>
        </article>

        {/* Footer */}
        <div className="mt-20 flex flex-col sm:flex-row justify-between items-center gap-6 pt-10 px-4 backdrop-blur-md shadow-none rounded-xl relative overflow-hidden bg-transparent">
          {/* 分享按钮 */}
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative group inline-flex items-center gap-3 px-6 py-2 rounded-full text-gray-900 bg-white/70 backdrop-blur-md border border-gray-300 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <span className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
              {[...Array(18)].map((_, i) => (
                <span
                  key={`base-${i}`}
                  className="absolute w-3 h-3 rounded-full bg-[radial-gradient(circle_at_center,#ffffff_30%,transparent_70%)] mix-blend-screen opacity-80 animate-[enhancedFloat_4s_cubic-bezier(0.4,0,0.6,1)_infinite]"
                  style={{
                    top: `${Math.random() * 120 - 10}%`,
                    left: `${Math.random() * 120 - 10}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    filter: `blur(${Math.random() * 4 + 2}px)`,
                    scale: `${0.6 + Math.random() * 0.8}`,
                  }}
                />
              ))}
            </span>
            <span className="absolute inset-0 rounded-full ring-1 ring-black/5 group-hover:ring-2 group-hover:ring-blue-300 transition-all duration-500 blur-sm" />
            <img src="/images/x.svg" alt="X icon" className="w-5 h-5 z-10" />
            <span className="text-sm font-semibold z-10 tracking-tight">この記事をシェア</span>
          </a>
        </div>
      </div>
    </div>
  );
}
