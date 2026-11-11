import Link from "next/link";
import SidebarCalendar from "../components/SidebarCalendarWrapper";
import { compareEventDatesDesc, fetchAllEvents, formatEventDate as formatJapanEventDate, parseEventDate } from "../lib/events";

// 事件数据结构
interface Event {
  id: number;
  title: string;
  slug: string;
  startDate: Date;
  endDate?: Date;
  location: string;
  imageUrl?: string;
}

// 获取事件数据
async function getEvents(): Promise<Event[]> {
  const events = await fetchAllEvents("symposium");

  return events.map((event) => {
    const imageFormats = event.image?.[0]?.formats;
    const imageUrl =
      imageFormats?.large?.url ||
      imageFormats?.medium?.url ||
      imageFormats?.small?.url ||
      imageFormats?.thumbnail?.url ||
      event.image?.[0]?.url;

    return {
      id: event.id,
      title: event.title || "無題",
      slug: event.slug || "no-slug",
      startDate: event.startDate ? parseEventDate(event.startDate) : new Date(NaN),
      endDate: event.endDate ? parseEventDate(event.endDate) : undefined,
      location: event.location || "不明",
      imageUrl: imageUrl ? `${imageUrl}` : undefined,
    };
  }).sort(compareEventDatesDesc);
}

// 日期格式化工具
const formatEventDate = (start: Date, end?: Date) => {
  return `${formatJapanEventDate(start)}${end ? ` ~ ${formatJapanEventDate(end)}` : ""}`;
};

// 事件卡片组件
const EventCard = ({ event }: { event: Event }) => {
  return (
    <div className="group relative border-0 p-5 rounded-2xl shadow-lg hover:shadow-2xl
                   transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                   bg-white hover:-translate-y-1.5 h-full flex flex-col min-w-0">
      {event.imageUrl && (
        <div className="flex items-center justify-center h-44 rounded-xl overflow-hidden mb-4 bg-gray-50 p-2">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="max-h-40 max-w-[85%] object-contain transition-transform duration-300
                      group-hover:scale-105"
          />
        </div>
      )}
      <h2 className="text-xl font-semibold mb-2 break-words">{event.title}</h2>
      <p className="text-gray-600 text-sm mb-2">{formatEventDate(event.startDate, event.endDate)}</p>
      <div className="flex items-start gap-2 text-gray-500 text-sm mb-4">
        <img src="/images/didian.svg" alt="Location" className="w-4 h-4 mt-0.5 shrink-0" />
        <span className="min-w-0 break-words">{event.location}</span>
      </div>
      <div className="mt-auto">
        <Link
          href={`/symposium/${event.slug}`}
          className="inline-block text-white font-medium
                    px-6 py-3 rounded-lg transition-all duration-300 ease-in-out
                    bg-gradient-to-r from-gray-700 to-gray-400
                    hover:scale-105 hover:shadow-lg hover:bg-gradient-to-r hover:from-gray-600 hover:to-gray-300"
        >
          詳細を見る →
        </Link>
      </div>
    </div>
  );
};

export default async function SymposiumPage() {
  const events = await getEvents();
  const itemsPerPage = 6;
  const totalPages = Math.ceil(events.length / itemsPerPage);
  const paginatedEvents = events.slice(0, itemsPerPage); // 默认显示第一页

  return (
    <div className="container mx-auto p-3 sm:p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 侧边栏 */}
        <aside className="w-full lg:w-[350px] p-4 backdrop-blur-md bg-white/50 border border-white/20 rounded-xl shadow-md z-10
                         order-2 lg:order-1 mb-6 lg:mb-0 sticky top-4 self-start">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 tracking-wide mb-4">イベントカレンダー</h2>
          </div>
          <SidebarCalendar />
        </aside>

        {/* 主要内容区域 */}
        <div className="min-w-0 flex-1 order-1 lg:order-2">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">公開講座・シンポジウム</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {paginatedEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {/* 分页组件 */}
          {events.length > itemsPerPage && (
            <div className="flex justify-center mt-8 space-x-2">
              <button
                disabled
                className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                前へ
              </button>
              <span className="px-4 py-2 text-gray-600">1 / {totalPages}</span>
              <button
                disabled
                className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                次へ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
