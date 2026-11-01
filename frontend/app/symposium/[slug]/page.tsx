import dayjs from "dayjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SidebarCalendar from "../../components/SidebarCalendarWrapper";

interface Event {
  id: number;
  title: string;
  slug: string;
  content: string;
  startDate: string;
  endDate?: string;
  location: string;
  image?: { url: string }[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:1337";

// 动态路径生成
export async function generateStaticParams() {
  const slugs = ["event","event-1", "event-2", "event-3", "event-4", "event-5"]; // 可动态生成
  return slugs.map((slug) => ({ slug }));
}

// 获取事件数据
async function getEvent(slug: string): Promise<Event | null> {
  const res = await fetch(`${API_BASE_URL}/api/events?populate=*&filters[category][$eq]=symposium`, {
    next: { revalidate: 3600 }, // 每小时重新验证
  });
  const { data } = await res.json();
  return data.find((ev: Event) => ev.slug === slug) || null;
}

export default async function SymposiumEventDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const event = await getEvent(slug);
  if (!event) {
    return <StatusDisplay message="イベントが見つかりません。" isError />;
  }

  const formatDate = (dateStr?: string) =>
    dateStr ? dayjs(dateStr).format("YYYY/MM/DD HH:mm") : "未定";

  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    event.title
  )}&url=${encodeURIComponent(`www.waseda-hanstudies.jp/symposium/${event.slug}`)}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-[350px] p-4 backdrop-blur-md bg-white/50 border border-white/20 rounded-xl shadow-md z-10 order-2 md:order-1 mb-6 md:mb-0 sticky top-4 self-start">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">イベントカレンダー</h2>
              <SidebarCalendar />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 bg-white/80 backdrop-blur-md rounded-xl shadow-lg overflow-hidden order-1 md:order-2">
            <div className="p-4 sm:p-8">
              {/* 返回按钮 */}
              <Link
                href="/symposium"
                className="group inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 mb-8"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                <span className="text-sm font-medium">戻る</span>
              </Link>

              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{event.title}</h1>

              <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-500 mb-6">
                <div className="flex items-center gap-2">
                  <img src="/images/riqi.svg" alt="date" className="w-4 h-4" />
                  <span>
                    {formatDate(event.startDate)}{" "}
                    {event.endDate && ` - ${formatDate(event.endDate)}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <img src="/images/didian.svg" alt="location" className="w-4 h-4" />
                  <span>{event.location}</span>
                </div>
              </div>

              {/* Markdown 渲染 */}
              <MarkdownContent content={event.content} />

              {/* 分享按钮 */}
              <div className="mt-8 flex justify-end">
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
                  <span className="text-sm font-semibold z-10 tracking-tight">このイベントをシェア</span>
                </a>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

// Markdown 内容渲染
const MarkdownContent = ({ content }: { content: string }) => (
  <div className="prose max-w-none text-gray-700">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ node, ...props }) => (
          <h1 className="text-4xl font-bold mt-8 mb-6 text-gray-900" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 className="text-3xl font-semibold mt-6 mb-4 text-gray-900" {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 className="text-2xl font-semibold mt-5 mb-3 text-gray-900" {...props} />
        ),
        h4: ({ node, ...props }) => (
          <p className="text-sm text-center leading-relaxed my-3 text-gray-700" {...props} />
        ),
        h5: ({ node, ...props }) => (
          <p className="text-xs text-center leading-relaxed my-3 text-gray-700" {...props} />
        ),
        h6: ({ node, ...props }) => (
          <p className="text-xs text-center leading-relaxed my-2 text-gray-600" {...props} />
        ),
        p: ({ node, ...props }) => (
          <p className="text-base leading-relaxed my-4 text-gray-800" {...props} />
        ),
        ul: ({ node, ...props }) => <ul className="list-disc list-inside my-4" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal list-inside my-4" {...props} />,
        li: ({ node, ...props }) => <li className="ml-6 my-1" {...props} />,
        blockquote: ({ node, ...props }) => (
          <blockquote className="border-l-4 border-blue-300 bg-blue-50/50 pl-4 pr-2 py-2 italic text-gray-700 my-6 rounded-md" {...props} />
        ),
        strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
        em: ({ node, ...props }) => <em className="italic" {...props} />,
        img: ({ node, ...props }) => {
            let imgSrc = props.src?.replace(/^https?:\/\/(localhost|127\.0\.0\.1):1337/, '') || '';
            return (
              <div className="my-6 flex flex-col items-center">
                <img
                  {...props}
                  src={imgSrc}
                  className="w-4/5 mx-auto my-2 rounded-lg shadow-md max-h-[380px] object-contain"
                />
              </div>
            );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
);

// 状态展示
const StatusDisplay = ({
  message,
  isError = false,
}: {
  message: string;
  isError?: boolean;
}) => (
  <div className="text-center py-10 text-lg">
    <p className={isError ? "text-red-600" : "text-gray-600"}>{message}</p>
  </div>
);