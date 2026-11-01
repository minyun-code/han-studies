"use client";

import { motion } from "framer-motion";

const groupedLinks = [
  {
    category: "大学図書館・校史館",
    links: [
      {
        title: "早稲田大学図書館",
        subtitle: "Waseda University Library",
        url: "https://www.waseda.jp/library/",
      },
      {
        title: "北京大学図書館",
        subtitle: "Peking University Library",
        url: "https://www.lib.pku.edu.cn/",
      },
      {
        title: "東京大学図書館",
        subtitle: "University of Tokyo",
        url: "https://www.lib.u-tokyo.ac.jp/ja",
      },
      {
        title: "北京大学档案館",
        subtitle: "Archives of Peking University",
        url: "https://www.dag.pku.edu.cn",
      },
      {
        title: "北京大学校史館",
        subtitle: "Museum of Peking University History",
        url: "https://www.xsg.pku.edu.cn",
      },
      {
        title: "早稲田大学歴史館",
        subtitle: "Waseda University History Museum",
        url: "https://www.waseda.jp/culture/archives/",
      },
    ],
  },
  {
    category: "大学研究機関・学術院",
    links: [
      {
        title: "早稲田大学文学学術院",
        subtitle: "Faculty of Letters, Arts and Sciences, Waseda University",
        url: "https://www.waseda.jp/flas/",
      },
      {
        title: "京都大学人文科学研究所",
        subtitle: "Institute for Research in Humanities, Kyoto University",
        url: "https://www.zinbun.kyoto-u.ac.jp/",
      },
      {
        title: "東京大学東洋文化研究所",
        subtitle: "Institute for Advanced Studies on Asia",
        url: "https://www.ioc.u-tokyo.ac.jp/",
      },
      {
        title: "東京大学東アジア藝文書院",
        subtitle: "East Asian Academy for New Liberal Arts, UTokyo",
        url: "https://www.eaa.c.u-tokyo.ac.jp/",
      },
      {
        title: "早稲田大学日本古典籍研究所",
        subtitle: "Research Institute of Japanese Classical Books",
        url: "https://www.waseda.jp/inst/cro/institutes-list/research-institute-of-japanese-classical-books/",
      },
      {
        title: "早稻田大学现代中国研究所",
        subtitle: "Waseda Institute of Contemporary Chinese Studies",
        url: "https://prj-wiccs.w.waseda.jp",
      },
    ],
  },
  {
    category: "国立機関・研究センター",
    links: [
      {
        title: "国立公文書館",
        subtitle: "National Archives of Japan",
        url: "https://www.archives.go.jp/",
      },
      {
        title: "国立国会図書館",
        subtitle: "National Diet Library, Japan",
        url: "https://www.ndl.go.jp/index.html",
      },
      {
        title: "日本学術振興会",
        subtitle: "Japan Society for the Promotion of Science",
        url: "https://www.jsps.go.jp/",
      },
      {
        title: "国際日本文化研究センター",
        subtitle: "International Research Center for Japanese Studies",
        url: "https://www.nichibun.ac.jp/ja/",
      },
      {
        title: "中国社会科学院近代史研究所",
        subtitle: "Institute of Modern History, CASS",
        url: "http://jds.cass.cn",
      },
    ],
  },
  {
    category: "民間学術機関",
    links: [
      {
        title: "東洋文庫",
        subtitle: "Toyo Bunko",
        url: "https://toyo-bunko.or.jp/",
      },
    ],
  },
];

export default function RelatedLinks() {
  return (
    <main className="min-h-screen px-6 py-20">
      <h1 className="text-4xl font-extrabold text-center mb-16 text-gray-900 tracking-tight">
        関連リンク
      </h1>

      <div className="space-y-16 max-w-7xl mx-auto">
        {groupedLinks.map((group, groupIdx) => (
          <section key={groupIdx}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-l-4 pl-4 border-blue-400">
              {group.category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {group.links.map((link, index) => (
                <motion.a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="block bg-white/30 border border-white/50 rounded-xl p-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:border-blue-300"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {link.title}
                  </h3>
                  <p className="text-sm text-gray-600">{link.subtitle}</p>
                </motion.a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
