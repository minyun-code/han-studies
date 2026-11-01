import Link from "next/link";
import { format, parseISO } from "date-fns";
import SidebarCalendar from "../../components/SidebarCalendarWrapper";

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

// 日期格式化工具
const formatEventDate = (start: Date, end?: Date) => {
  const dateFormat = "yyyy/MM/dd";
  const timeFormat = "HH:mm";

  if (!end ) {
    return `${format(start, `${dateFormat} ${timeFormat}`)} ~ ${format(start, `${dateFormat} ${timeFormat}`)}`;
  }
  return `${format(start, `${dateFormat} ${timeFormat}`)} ~ ${format(end, `${dateFormat} ${timeFormat}`)}`;
};

// 事件卡片组件
const EventCard = ({ event }: { event: Event }) => {
  return (
    <div className="group relative border-0 p-5 rounded-2xl shadow-lg hover:shadow-2xl
                   transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                   bg-white hover:-translate-y-1.5 h-full flex flex-col">
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
      <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
      <p className="text-gray-600 text-sm mb-2">{formatEventDate(event.startDate, event.endDate)}</p>
      <div className="flex items-start gap-2 text-gray-500 text-sm mb-4">
        <img src="/images/didian.svg" alt="Location" className="w-4 h-4 mt-0.5" />
        <span>{event.location}</span>
      </div>
      <div className="mt-auto">
        <Link
          href={`/news/events/${event.slug}`}
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

// 获取事件数据
async function getEvents(): Promise<Event[]> {
  const res = await fetch("http://127.0.0.1:1337/api/events?populate=*");
  const responseData = await res.json();

  return responseData.data.map((event: any) => {
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
      startDate: event.startDate ? parseISO(event.startDate) : new Date(),
      endDate: event.endDate ? parseISO(event.endDate) : undefined,
      location: event.location || "不明",
      imageUrl: imageUrl ? `${imageUrl}` : undefined,
    };
  });
}

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div className="container mx-auto p-3 sm:p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 侧边栏 */}
        <aside className="w-full lg:w-[350px] p-4 backdrop-blur-md bg-white/50 border border-white/20 rounded-xl shadow-md z-10
                         order-2 lg:order-1 mb-6 lg:mb-0 sticky top-4 self-start">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 tracking-wide">イベントカレンダー</h2>
          </div>
          <SidebarCalendar />
        </aside>

        {/* 主要内容区域 */}
        <div className="flex-1 order-1 lg:order-2">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">イベント情報</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {events.reverse().map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
