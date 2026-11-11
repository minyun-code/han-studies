export interface CmsImage {
  url: string;
  formats?: Partial<Record<"large" | "medium" | "small" | "thumbnail", { url: string }>>;
}

export interface CmsEvent {
  id: number;
  title: string;
  slug: string;
  content: string;
  startDate: string;
  endDate?: string;
  location: string;
  category?: "symposium" | "seminar";
  image?: CmsImage[];
}

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:1337").replace(/\/$/, "");

// Read every published page so static export never silently omits newer events.
export async function fetchAllEvents(category?: CmsEvent["category"]): Promise<CmsEvent[]> {
  const events: CmsEvent[] = [];
  let page = 1;
  let pageCount = 1;

  do {
    const query = new URLSearchParams({
      populate: "*",
      "pagination[page]": String(page),
      "pagination[pageSize]": "100",
      "sort[0]": "startDate:desc",
      "sort[1]": "id:desc",
    });
    if (category) query.set("filters[category][$eq]", category);

    const response = await fetch(`${API_BASE_URL}/api/events?${query}`, { cache: "force-cache" });
    if (!response.ok) {
      throw new Error(`Failed to load CMS events (page ${page}): HTTP ${response.status}`);
    }

    const payload = await response.json();
    pageCount = payload.meta?.pagination?.pageCount;
    if (!Array.isArray(payload.data) || !Number.isInteger(pageCount) || pageCount < 0) {
      throw new Error(`Invalid CMS events response on page ${page}`);
    }
    events.push(...payload.data);
    page += 1;
  } while (page <= pageCount);

  return events;
}

// Strapi stores offsets in ISO timestamps; a timestamp without an offset is
// interpreted as Japanese local time, independently of the build machine.
export function parseEventDate(value: string | Date): Date {
  if (value instanceof Date) return value;
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const timestamp = dateOnly ? `${value}T00:00:00+09:00` : value;
  return new Date(/(?:Z|[+-]\d{2}:?\d{2})$/i.test(timestamp) ? timestamp : `${timestamp}+09:00`);
}

function tokyoDateParts(value: string | Date) {
  const date = parseEventDate(value);
  if (Number.isNaN(date.getTime())) return undefined;
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  return Object.fromEntries(parts.map(({ type, value: part }) => [type, part]));
}

export function toTokyoDateKey(value: string | Date): string {
  const parts = tokyoDateParts(value);
  return parts ? `${parts.year}-${parts.month}-${parts.day}` : "";
}

export function formatEventDate(value?: string | Date, includeTime = true): string {
  if (!value) return "未定";
  const parts = tokyoDateParts(value);
  if (!parts) return "未定";
  const date = `${parts.year}/${parts.month}/${parts.day}`;
  return includeTime ? `${date} ${parts.hour}:${parts.minute} JST` : date;
}

export function compareEventDatesDesc(
  a: { startDate?: string | Date },
  b: { startDate?: string | Date },
): number {
  const timestamp = (value?: string | Date) => {
    const result = value ? parseEventDate(value).getTime() : NaN;
    return Number.isNaN(result) ? -Infinity : result;
  };
  const aTime = timestamp(a.startDate);
  const bTime = timestamp(b.startDate);
  return aTime === bTime ? 0 : aTime < bTime ? 1 : -1;
}
