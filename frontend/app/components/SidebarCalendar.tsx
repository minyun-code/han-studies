"use client";

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { Box, Paper, Typography, Chip, Divider, IconButton } from "@mui/material";
import { format } from "date-fns";
import { useState, useEffect, useRef } from "react";
import { Event } from './SidebarCalendarWrapper';
import {
  formatEventDate as formatJapanEventDate,
  parseEventDate,
  toTokyoDateKey,
} from "../lib/events";

// 实际的日历组件实现
function CalendarImplementation({ events = [] }: { events: Event[] }) {
  // 使用客户端状态来控制选中的日期和显示的事件
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [processedEvents, setProcessedEvents] = useState<Event[]>([]);
  const eventDetailRef = useRef<HTMLDivElement>(null);

  // 处理事件数据，确保日期是Date对象
  useEffect(() => {
    // 处理从服务器传来的可能是字符串的日期
    const processed = events.map(event => ({
      ...event,
      startDate: parseEventDate(event.startDate),
      endDate: event.endDate ? parseEventDate(event.endDate) : undefined
    }));

    setProcessedEvents(processed);
  }, [events]);

  // 添加点击外部关闭事件详情的功能
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (eventDetailRef.current && !eventDetailRef.current.contains(event.target as Node)) {
        setSelectedEvent(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 检查某个日期是否有事件
  const getEventForDate = (date: Date) => {
    if (!date || processedEvents.length === 0) return null;

    return processedEvents.find(e => {
      // Calendar cells represent their displayed civil date in the browser's
      // time zone; event instants must always be matched to their Japanese date.
      return toTokyoDateKey(e.startDate) === format(date, "yyyy-MM-dd");
    }) ?? null;
  };

  // 处理日期变更
  const handleDateChange = (date: Date) => {
    // 更新选中的日期
    setSelectedDate(date);

    // 检查是否有事件
    const event = getEventForDate(date);
    setSelectedEvent(event);
  };

  // 关闭事件详情
  const handleCloseEventDetail = () => {
    setSelectedEvent(null);
  };

  // 格式化事件日期的工具函数
  const formatEventDate = (dateValue: string | Date) => {
    return formatJapanEventDate(dateValue, false);
  };

  // 截断过长的内容并添加省略号，同时过滤掉图片标记
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    // 过滤掉Markdown图片标记 ![...](...)
    const textWithoutImages = text.replace(/!\[.*?\]\(.*?\)/g, '');
    // 清理多余的空行
    const cleanedText = textWithoutImages.replace(/\n\s*\n/g, '\n').trim();
    return cleanedText.length > maxLength ? cleanedText.substring(0, maxLength) + '...' : cleanedText;
  };



  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="backdrop-blur-md rounded-lg p-4 md:p-6 shadow-lg border border-white/10 w-full min-w-[280px] relative overflow-visible">
        {/* 使用MUI的原生日期选择事件 */}
        <DateCalendar
          value={selectedDate}
          onChange={(newDate) => {
            if (newDate) handleDateChange(newDate);
          }}
          sx={{
            width: '100%',
            '& .MuiDayCalendar-header, & .MuiDayCalendar-weekContainer': {
              justifyContent: 'space-around',
              width: '100%'
            }
          }}
          slotProps={{
            day: (ownerState) => {
              const event = getEventForDate(ownerState.day);
              return {
                sx: {
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  bgcolor: event ? "blue" : "transparent",
                  color: event ? "white" : "inherit",
                  fontWeight: event ? "bold" : "normal",
                  cursor: "pointer",
                  "&:hover": { bgcolor: "lightblue" },
                },
              } as any;
            },
          }}
        />

        {/* 事件详情 - 只在选中有事件的日期时显示 */}
        {selectedEvent && (
          <Paper
            ref={eventDetailRef}
            elevation={3}
            sx={{
              position: "absolute",
              top: 10,
              left: { xs: 0, md: "100%" },
              ml: { xs: 0, md: 2 },
              width: { xs: "100%", md: 280 },
              maxWidth: { xs: "100%", md: "none" },
              boxSizing: "border-box",
              overflowWrap: "anywhere",
              p: 2,
              bgcolor: "white",
              borderRadius: 2,
              boxShadow: 3,
              zIndex: 1000,
            }}
          >
            {/* 关闭按钮 */}
            <IconButton
              onClick={handleCloseEventDetail}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                width: 28,
                height: 28,
                zIndex: 1,
                p: 0.5,
                color: 'grey.500',
                '&:hover': {
                  color: 'grey.800',
                  bgcolor: 'grey.100',
                }
              }}
              aria-label="close event detail"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </IconButton>

            {selectedEvent.imageUrl && (
              <Box
                component="img"
                src={selectedEvent.imageUrl}
                alt={selectedEvent.title}
                sx={{ width: "100%", borderRadius: 2, mb: 1 }}
              />
            )}

            {selectedEvent.category && (
              <Chip
                label={selectedEvent.category}
                size="small"
                color="primary"
                sx={{ mb: 1 }}
              />
            )}

            <Link
              href={`/news/events/${selectedEvent.slug}`}
              style={{ textDecoration: 'none' }}
            >
              <Typography
                variant="subtitle1"
                color="primary"
                fontWeight="bold"
                sx={{
                  '&:hover': {
                    textDecoration: 'underline',
                    cursor: 'pointer'
                  }
                }}
              >
                {selectedEvent.title}
              </Typography>
            </Link>

            <Typography variant="body2" sx={{ fontSize: "0.75rem", mt: 1 }}>
              日付: {formatEventDate(selectedEvent.startDate)}
              {selectedEvent.endDate && ` ~ ${formatEventDate(selectedEvent.endDate)}`}
              {" (日本時間)"}
            </Typography>

            <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
              場所: {selectedEvent.location}
            </Typography>

            {selectedEvent.content && (
              <>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" sx={{ fontSize: "0.75rem", mt: 1, whiteSpace: 'pre-line' }}>
                  {truncateText(selectedEvent.content, 150)}
                </Typography>
              </>
            )}
          </Paper>
        )}
      </div>
    </LocalizationProvider>
  );
}

// 使用动态导入包装实际的日历组件，确保只在客户端渲染
const DynamicCalendar = dynamic(
  () => Promise.resolve(CalendarImplementation),
  { ssr: false, loading: () => <div className="backdrop-blur-md rounded-lg p-4 shadow-lg border border-white/10 min-w-[280px]">日历加载中...</div> }
);

// 导出组件，供服务器组件使用
export default function SidebarCalendar({ events }: { events: Event[] }) {
  return <DynamicCalendar events={events} />;
}
