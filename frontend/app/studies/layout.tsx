import SidebarCalendarWrapper from "../components/SidebarCalendarWrapper";

export default function StudiesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
        {/* 侧边栏日历，添加响应式类 */}
        <div className="w-full lg:w-1/4 shrink-0 order-2 lg:order-1 z-10">
          <div className="sticky top-8 transition-all duration-300">
            <SidebarCalendarWrapper />
          </div>
        </div>

        {/* 主内容区域，保持正常样式 */}
        <div className="w-full lg:w-3/4 order-1 lg:order-2">
          {children}
        </div>
      </div>
    </div>
  );
}
