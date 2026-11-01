'use client';

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// 类型定义
interface SearchResult {
  id: string;
  _type: string;
  slug?: string;
  title?: string;
  name?: string;
  description?: string;
  department?: string;
}

const COLLECTIONS = [
  { type: "announcement", endpoint: "/api/announcements", fields: ["title", "content"] },
  { type: "event", endpoint: "/api/events", fields: ["title", "content", "location"] },
  { type: "project", endpoint: "/api/projects", fields: ["title", "description", "content"] },
  { type: "publication", endpoint: "/api/publications", fields: ["title", "publisher", "description"] },
  { type: "researcher", endpoint: "/api/researchers", fields: ["name", "title", "department"] },
];

const routeMap: Record<string, string> = {
  announcement: "/news/announcements/",
  event: "/news/events/",
  project: "/projects/",
  publication: "/publications/",
  researcher: "/researchers/",
};

export default function SearchResults() {
  const searchParams = useSearchParams();
  const keyword = searchParams.get("keyword") || "";
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true); // 初始状态改为 true 以匹配 Suspense
  const [error, setError] = useState("");

  useEffect(() => {
    if (!keyword.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const allResults = await Promise.all(
          COLLECTIONS.map(async ({ type, endpoint, fields }) => {
            try {
              const filters = fields
                .map((field) => `filters[${field}][$containsi]=${encodeURIComponent(keyword)}`)
                .join("&");

              const res = await fetch(
                `${endpoint}?${filters}&populate=*`,
                { signal: controller.signal }
              );

              if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

              const data = await res.json();
              return (data.data || []).map((item: any) => ({
                id: item.id,
                _type: type,
                slug: item.attributes?.slug || undefined,
                title: item.attributes?.title || item.attributes?.name || "No Title",
                description: item.attributes?.description || "",
                department: item.attributes?.department || "",
              }));
            } catch (err) {
              console.error(`Error fetching ${type}:`, err);
              return [];
            }
          })
        );

        setResults(allResults.flat());
        setError("");
      } catch (err) {
        if (!(err instanceof DOMException)) { // 忽略 AbortError
          console.error("Global search error:", err);
          setError("搜索失败，请稍后重试。");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, [keyword]);

  const groupedResults = results.reduce((acc, item) => {
    const typeKey = item._type || "other";
    acc[typeKey] = acc[typeKey] || [];
    acc[typeKey].push(item);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  if (loading) return null; // 由 Suspense fallback 处理加载状态

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">「{keyword}」の検索結果</h1>

      {error && <p className="text-red-500">{error}</p>}

      {!loading && results.length === 0 && keyword.trim() && (
        <p>データがありません。</p>
      )}

      {Object.keys(groupedResults).map((typeKey) => (
        <div key={typeKey} className="mb-6">
          <h2 className="text-xl font-bold mb-2">
            {routeMap[typeKey] ? `${typeKey} の結果` : "その他の結果"}
            ({groupedResults[typeKey].length}件)
          </h2>
          <ul className="space-y-3">
            {groupedResults[typeKey].map((item) => {
              const base = routeMap[item._type] || "/";
              const linkHref = item.slug ? `${base}${item.slug}` : "#";
              return (
                <li key={`${item._type}-${item.id}`}>
                  <Link
                    href={linkHref}
                    className="text-blue-600 hover:underline transition-colors duration-200 block py-1"
                  >
                    {item.title}
                    {item.department && (
                      <span className="text-gray-500 text-sm ml-2">
                        ({item.department})
                      </span>
                    )}
                  </Link>
                  {item.description && (
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </>
  );
}