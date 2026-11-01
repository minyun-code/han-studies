"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "../swiper-custom.css";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from 'react';

interface CarouselSlide {
  id: number;
  imageUrl: string;
  title: string;
  slug: string;
  publishDate?: string;
  priority: boolean;
}

interface CarouselClientProps {
  slides: CarouselSlide[];
}

export default function CarouselClient({ slides }: CarouselClientProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className={`w-screen ${isMobile ? 'h-[50vh]' : 'h-screen'} relative z-10 overflow-hidden`}>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000 }}
        loop
        className="w-full h-full"
      >
        {slides.map((slide, index) => {
          return (
            <SwiperSlide key={slide.id} className="w-full h-full relative">
              <div className="relative w-full h-full">
                <Image
                  src={slide.imageUrl}
                  alt={slide.title}
                  fill
                  sizes="100vw"
                  priority={slide.priority}
                  className="object-cover object-center"
                />

                {/* 渐变遮罩 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* 新闻标题覆盖层 */}
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white z-20">
                  <div className="max-w-4xl mx-auto">
                    <Link
                      href={`/news/announcements/${slide.slug}`}
                      className="group block"
                    >
                      <h2 className="text-2xl md:text-4xl font-bold mb-4 leading-tight group-hover:text-blue-300 transition-colors duration-300">
                        {slide.title}
                      </h2>

                      {slide.publishDate && (
                        <div className="flex items-center text-sm md:text-base text-gray-300">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          {new Date(slide.publishDate).toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      )}

                      <div className="mt-4 inline-flex items-center text-blue-300 group-hover:text-white transition-colors duration-300">
                        <span className="mr-2">詳細を見る</span>
                        <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}