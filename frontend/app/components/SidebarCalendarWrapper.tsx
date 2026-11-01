import SidebarCalendar from './SidebarCalendar';

// API基础URL
const API_BASE_URL = "http://127.0.0.1:1337";

// 事件接口定义
export interface Event {
  id: string;
  title: string;
  startDate: Date | string;
  endDate?: Date | string;
  location: string;
  imageUrl?: string;
  content?: string;
  category?: string;
  slug: string;
}

/**
 * 从API获取事件数据
 * @returns Promise<Event[]> 事件数据数组
 */
async function getEvents(): Promise<Event[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/events?populate=*`, {
      cache: "force-cache",
    });

    const data = await res.json();

    // 确保data是数组，如果不是数组但有data属性是数组，则使用该属性
    const eventsArray = Array.isArray(data) ? data : (data.data || []);
    return eventsArray.map((event: any) => {
      // 直接处理顶层属性的情况
      if (event.id && event.title && event.startDate) {
        return {
          id: event.id.toString(),
          title: event.title || "未命名事件",
          startDate: new Date(event.startDate),
          endDate: event.endDate ? new Date(event.endDate) : undefined,
          location: event.location || "未知",
          content: event.content || "",
          slug: event.slug || "",
          category: event.category || "",
          imageUrl: event.image && Array.isArray(event.image) && event.image.length > 0
            ? `${event.image[0].url}`
            : undefined,
        };
      }


    });
  } catch (error) {
    console.error('获取事件数据失败:', error);
    return [];
  }
}

// 序列化事件数据，确保日期以字符串形式传递
const serializeEvents = (events: any[]): Event[] => {
  try {
    return events.map(event => ({
      id: event.id || '',
      title: event.title || '',
      // 确保日期是字符串格式
      startDate: event.startDate instanceof Date
        ? event.startDate.toISOString()
        : typeof event.startDate === 'string'
          ? event.startDate
          : new Date().toISOString(),
      endDate: event.endDate
        ? (event.endDate instanceof Date
            ? event.endDate.toISOString()
            : typeof event.endDate === 'string'
              ? event.endDate
              : undefined)
        : undefined,
      location: event.location || '',
      content: event.content || '',
      category: event.category || '',
      imageUrl: event.imageUrl || undefined,
      slug: event.slug || ''
    }));
  } catch (error) {
    console.error('序列化事件数据失败:', error);
    return [];
  }
};

export default async function SidebarCalendarWrapper() {
  // 从API获取事件数据
  let events: Event[] = [];

  try {
    const fetchedEvents = await getEvents();
    if (!fetchedEvents || !Array.isArray(fetchedEvents)) {
      console.error('获取的事件数据无效:', fetchedEvents);
    } else {
      // 序列化事件数据以确保SSG兼容性
      events = serializeEvents(fetchedEvents);
    }
  } catch (error) {
    console.error('获取事件数据失败:', error);
  }

  // 返回客户端组件，传递序列化后的事件数据
  return <SidebarCalendar events={events} />;
}
