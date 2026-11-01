

import React from "react";

interface Publication {
  id: number;
  title: string;
  publisher?: string;
  price?: string;
  publishDate?: string;
  size?: string;
  description?: string;
  detailLink?: string;
  coverImage?: { url: string }[];
}

const API_BASE_URL = "http://127.0.0.1:1337";

// 获取出版物数据
async function getPublications(): Promise<Publication[]> {
  const res = await fetch(`${API_BASE_URL}/api/publications?populate=*`, {
    cache: "force-cache",
  });
  const data = await res.json();

  return data.data.map((pub: any) => ({
    id: pub.id,
    title: pub.title,
    publisher: pub.publisher,
    price: pub.price,
    publishDate: pub.publishDate,
    size: pub.size,
    description: pub.description,
    detailLink: pub.detailLink,
    coverImage: pub.coverImage || [],
  }));
}

export default async function PublicationsPage() {
  const publications = await getPublications();

  return (
    <main
      style={{
        padding: "40px 20px",
        fontFamily: `'Noto Serif JP', serif`,
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          maxWidth: "1600px",
          margin: "0 auto",
          padding: "40px",
          borderRadius: "20px",
          backgroundColor: "rgba(255, 255, 255, 0.15)", // 更透明
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)", // for Safari
          border: "1px solid rgba(255, 255, 255, 0.3)", // 模拟玻璃边缘高亮
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <h1
          style={{
            fontSize: "2.4rem",
            fontWeight: "bold",
            marginBottom: "40px",
            borderBottom: "2px solid #ccc",
            paddingBottom: "12px",
            color: "#222",
          }}
        >
          出版物一覧
        </h1>

        {publications.map((pub) => {
          const imageUrl = pub.coverImage?.[0]?.url
            ? `${pub.coverImage[0].url}`
            : null;

          return (
            <div
              key={pub.id}
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                gap: "24px",
                padding: "24px 0",
                borderBottom: "1px solid #ddd",
              }}
            >
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt={pub.title}
                  style={{
                    width: "120px",
                    height: "160px",
                    objectFit: "cover",
                    borderRadius: "6px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                    flexShrink: 0,
                  }}
                />
              )}
              <div style={{ flex: 1, minWidth: "240px" }}>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "8px" }}>
                  {pub.title}
                </h2>
                <div style={{ fontSize: "1.1rem", marginBottom: "4px" }}>
                  {pub.publisher || "-"}
                </div>
                <div style={{ fontSize: "1.1rem", marginBottom: "4px" }}>
                  刊行日: {pub.publishDate || "-"}
                </div>
                <div style={{ fontSize: "1.1rem", marginBottom: "4px" }}>
                  サイズ: {pub.size || "-"}
                </div>
                {pub.detailLink && (
                  <div style={{ marginTop: "6px" }}>
                    <a
                      href={pub.detailLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#0055aa", textDecoration: "underline" }}
                    >
                      詳細を見る →
                    </a>
                  </div>
                )}
                <div style={{ marginTop: "12px", fontSize: "1.05rem", lineHeight: 1.6 }}>
                  {pub.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
