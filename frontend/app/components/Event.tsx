import Link from "next/link";
import Calendar from "./SidebarCalendarWrapper";
import ScrollReveal from "./ScrollReveal";
import Image from "next/image";
import { compareEventDatesDesc, fetchAllEvents, toTokyoDateKey } from "../lib/events";

interface Event {
  slug: string;
  id: number;
  title: string;
  startDate: string;
}

// 获取事件数据
async function getEvents(): Promise<Event[]> {
  return (await fetchAllEvents())
    .filter((event) => event.startDate && event.slug)
    .sort(compareEventDatesDesc)
    .slice(0, 5);
}

export default async function Events() {
  const events = await getEvents();

  return (
    <ScrollReveal>
      <section className="relative py-28 overflow-visible">
        <div className="max-w-8xl mx-auto px-5 sm:px-8 lg:px-12 xl:px-20 relative">
          <header className="mb-10 text-center space-y-4">
            {/* 使用图片替代"研究・教育"文字 */}
            <div className="flex justify-center">
              <Image
                src="/images/title-research-education.png"
                alt="研究・教育"
                width={320}
                height={100}
                className="h-auto"
              />
            </div>



            <div className="relative w-32 h-[2px] mx-auto rounded-full overflow-hidden bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500" />
          </header>

          <div className="grid lg:grid-cols-[1fr_1.5fr] gap-16">
            {/* Calendar */}
            <div className="relative bg-white rounded-2xl shadow-xl p-8 border border-gray-200/60 backdrop-blur-sm z-10 overflow-visible">
              <Calendar />
            </div>

            {/* 活动列表 */}
            <div className="min-w-0 bg-white/90 backdrop-blur-md rounded-2xl shadow-md p-10 border border-gray-300/50">
              <h3 className="text-3xl font-Noto Serif Jp text-gray-900 mb-8">近日予定</h3>

              <ul className="space-y-6">
                {events.map((event) => (
                  <li
                    key={event.id}
                    className="group p-6 bg-gradient-to-r from-gray-50 to-white rounded-xl transition-all duration-300 hover:shadow-md border border-gray-300/50"
                  >
                    <Link href={`/news/events/${event.slug ?? event.id}`} className="flex items-start space-x-6">
                      <div className="relative flex-shrink-0">
                        <div className="w-14 h-14 bg-white rounded-lg shadow-md flex flex-col items-center justify-center border border-gray-300/70 transition-all group-hover:scale-110">
                          <time className="text-2xl font-bold text-gray-800">
                            {Number(toTokyoDateKey(event.startDate).slice(8, 10))}
                          </time>
                          <span className="text-xs text-gray-600 font-medium">
                            {Number(toTokyoDateKey(event.startDate).slice(5, 7))}月
                          </span>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xl font-medium text-gray-900 group-hover:text-gray-700 break-words">
                          {event.title}
                          <span className="ml-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            ↗
                          </span>
                        </h4>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-12 flex justify-end">
                <Link
                  href="/news/events"
                  className="px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-600 rounded-xl text-white font-medium shadow-md hover:shadow-lg transition-all"
                >
                  さらに詳しく
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
