import Image from "next/image";
import Link from "next/link";
import CarouselClient from "./CarouselClient";

interface NewsItem {
  id: number;
  title: string;
  slug: string;
  publishDate?: string;
  image?: string | null;
}

const API_BASE_URL = "http://127.0.0.1:1337";

// 获取新闻数据
async function getNewsData(): Promise<NewsItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/announcements?populate=*`, {
      cache: 'force-cache',
      next: { revalidate: 3600 } // 1小时重新验证
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    if (!data.data || !Array.isArray(data.data)) {
      return [];
    }

    return data.data.map((item: any) => ({
      id: item.id,
      title: item.attributes?.title || item.title || 'Untitled',
      slug: item.attributes?.slug || item.slug || 'untitled',
      publishDate: item.attributes?.publishDate || item.publishDate,
      image: item.attributes?.image?.data?.[0]?.attributes?.url ||
             item.image?.[0]?.url ||
             item.attributes?.image?.data?.attributes?.url ||
             null,
    }));
  } catch (error) {
    console.error('Failed to fetch news data:', error);
    // 返回静态数据作为后备
    return [
      {
        id: 1,
        title: "欢迎访问汉学研究中心",
        slug: "welcome",
        publishDate: new Date().toISOString(),
        image: null
      },
      {
        id: 2,
        title: "最新研究成果发布",
        slug: "latest-research",
        publishDate: new Date().toISOString(),
        image: null
      },
      {
        id: 3,
        title: "学术交流活动通知",
        slug: "academic-exchange",
        publishDate: new Date().toISOString(),
        image: null
      }
    ];
  }
}

export default async function Carousel() {
  // 在构建时获取新闻数据
  const newsData = await getNewsData();
  const displayData = newsData.slice(0, 5); // 只取前5条新闻

  if (displayData.length === 0) {
    return (
      <div className="w-screen h-screen md:h-screen relative z-10 overflow-hidden flex items-center justify-center bg-gray-100">
        <div className="text-gray-600">暂无新闻数据</div>
      </div>
    );
  }

  // 准备轮播数据
  const carouselSlides = displayData.map((news, index) => {
    const imageUrl = news.image
      ? `/uploads/${news.image.split('/').pop()}`
      : '/images/slider_1.jpg';

    return {
      id: news.id,
      imageUrl,
      title: news.title,
      slug: news.slug,
      publishDate: news.publishDate,
      priority: index === 0
    };
  });

  return <CarouselClient slides={carouselSlides} />;
}
