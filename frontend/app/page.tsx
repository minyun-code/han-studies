import { Suspense } from "react";
import Carousel from "./components/Carousel";
import NewsSummary from "./components/NewsSummary";
import Event from "./components/Event";
import Projects from "./components/Projects";
import PublicationsPreview from "./components/PublicationsPreview";

export default function Home() {
  return (
    <div className="min-h-screen bg-transparent">
      {/* 轮播图 */}
      <Carousel />

      <div className="max-w-6xl mx-auto flex flex-col items-center space-y-0.1">
        <Suspense fallback={<div>Loading...</div>}>
          <NewsSummary />
        </Suspense>

        <Suspense fallback={<div>Loading...</div>}>
          <Event />
        </Suspense>

        <Suspense fallback={<div>Loading...</div>}>
          <Projects />
        </Suspense>

        <Suspense fallback={<div>Loading...</div>}>
          <PublicationsPreview />
        </Suspense>
      </div>
    </div>
  );
}
