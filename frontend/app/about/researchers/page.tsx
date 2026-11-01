import { AnimatedResearcher } from "./components/AnimatedResearcher";
import type { Researchers } from "./types";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

// ✅ 分组类型
type ResearchersGrouped = {
  [key: string]: Researchers[];
};

// ✅ 显示顺序 & 标题映射（中文可改英文）
const positionOrder = ["A_所長", "B_副所長", "C_研究所員", "D_招聘研究員"];
const positionTitleMap: { [key: string]: string } = {
  A_所長: "所長",
  B_副所長: "副所長",
  C_研究所員: "研究所員",
  D_招聘研究員: "招聘研究員",
};

// API 响应类型
interface ApiResponse {
  data: Researchers[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// SSG: 服务端获取所有分页数据
async function fetchAllResearchers(): Promise<ResearchersGrouped> {
  let allResearchers: Researchers[] = [];
  let currentPage = 1;
  let hasMorePages = true;

  while (hasMorePages) {
    const res = await fetch(
      `http://127.0.0.1:1337/api/researchers?locale=ja-JP&sort=order:asc&pagination[page]=${currentPage}&pagination[pageSize]=100`,
      { cache: 'force-cache' }
    );
    const json: ApiResponse = await res.json();
    if (json.data && json.data.length > 0) {
      allResearchers = [...allResearchers, ...json.data];
    }
    hasMorePages = currentPage < json.meta.pagination.pageCount;
    currentPage++;
  }

  // 分组
  const grouped: ResearchersGrouped = {};
  for (const item of allResearchers) {
    const pos = item.positionType || "その他";
    if (!grouped[pos]) grouped[pos] = [];
    grouped[pos].push(item);
  }
  // 每组内部排序
  Object.keys(grouped).forEach((group) => {
    grouped[group].sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
  });
  return grouped;
}

export default async function ResearchersPage() {
  const researchers = await fetchAllResearchers();

  return (
    <div className="flex flex-col items-center py-12 px-6">
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-12">
        研究員紹介
      </h1>

      {Object.keys(researchers).length === 0 ? (
        <p className="text-lg text-gray-600">データがありません</p>
      ) : (
        positionOrder.map((positionKey) =>
          researchers[positionKey] ? (
            <div key={positionKey} className="w-full max-w-6xl mb-16">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                {positionTitleMap[positionKey] || positionKey}
              </h2>

              <div className={`grid ${
                positionKey === "A_所長" || positionKey === "B_副所長"
                  ? "grid-cols-1 max-w-2xl mx-auto"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              } gap-8`}>
                {researchers[positionKey].map((researcher: Researchers) => (
                  <AnimatedResearcher
                    key={researcher.id}
                    researcher={researcher}
                  />
                ))}
              </div>
            </div>
          ) : null
        )
      )}
    </div>
  );
}
