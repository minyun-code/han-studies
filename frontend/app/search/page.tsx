import { Suspense } from "react";
import SearchClient from "././SearchClient";

export default function SearchPageWrapper() {
  return (
    <Suspense fallback={<p className="p-6">検索中...</p>}>
      <SearchClient />
    </Suspense>
  );
}
