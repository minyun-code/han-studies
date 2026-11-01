import Link from "next/link";

export default function StudiesMain() {
  return (
    <div className="p-6 bg-gradient-to-br from-cyan-500/15 to-blue-500/15 rounded-2xl min-h-screen">

      {/* 外层卡片容器，与侧边栏风格统一 */}
      <div className=" p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          研究活動
          <span className="block w-16 h-1.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mt-4"></span>
        </h1>

        {/* 使用 grid 实现响应式布局，并让卡片等高 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {[
            {
              href: "/studies/projects",
              title: "プロジェクト・研究テーマ",
            },
            {
              href: "/studies/seminars",
              title: "研究会・セミナー情報",
            }
        
          ].map((item) => (
            <Link key={item.href} href={item.href} className="h-full group">
             <div className="relative h-full p-8 bg-white/90 backdrop-blur-xl rounded-3xl shadow-md hover:shadow-2xl transform transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:scale-[1.03] hover:-translate-y-1 hover:border-cyan-100/40">


                 {/* 渐变光晕层 */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-cyan-100/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl "></div>
               
                {/* 卡片标题 */}
                <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight leading-snug ">
                  {item.title}
                </h2>

                {/* 动态箭头：初始隐藏，悬浮时右移并渐显 */}
                <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <svg
                    className="w-6 h-6 text-cyan-500 transform group-hover:translate-x-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                 {/* 微光动画 */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl  ">
              <div className="absolute -left-56 top-0 w-56 h-full bg-gradient-to-r from-white/0 via-white/40 to-white/0 opacity-0 group-hover:opacity-100 group-hover:animate-shine rounded-3xl"></div>
            </div>

                {/* 粒子效果层：可选，用于增加动态细节 */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-cyan-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>

                  {[...Array(6)].map((_, i) => (
                    <span
                      key={i}
                      className="absolute w-1.5 h-1.5 rounded-full bg-white/50 blur-sm opacity-20 animate-[particleFlow_6s_linear_infinite]"
                      style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2}s`,
                      }}
                    />
                    
                  ))}
                </div>
    
              
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
