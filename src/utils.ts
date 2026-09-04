import { useState, useEffect } from "react";

const READER_COLORS = [
  "#3B82F6",
  "#10B981",
  "#8B5CF6",
  "#F59E0B",
  "#EF4444",
  "#14B8A6",
  "#EC4899",
  "#6366F1",
] as const;

export const uid = () => Math.random().toString(36).slice(2, 10);
export const hash = (str: string) => (str || "?").split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

export function useIsMobile() {
  const [mobile, setMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 860 : false);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 860);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mobile;
}

export function fileToDataUrl(file: File, cb: (url: string) => void) {
  const reader = new FileReader();
  reader.onload = () => cb(reader.result as string);
  reader.readAsDataURL(file);
}

export function wordCount(html: string) {
  const text = html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").trim();
  return text ? text.split(/\s+/).length : 0;
}

export function activityWithDates(seed: string) {
  const data: { level: number; date: Date }[] = [];
  let s = hash(seed);
  const today = new Date();
  for (let i = 0; i < 52 * 7; i++) {
    s = (s * 1103515245 + 12345) >>> 0;
    const level = s % 6 < 3 ? 0 : (s % 5);
    const d = new Date(today);
    d.setDate(d.getDate() - (52 * 7 - 1 - i));
    data.push({ level, date: d });
  }
  return data;
}

export const DATE_FMT = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" });

export function pointInPolygon(pt: [number, number], poly: [number, number][]) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
    const intersect = ((yi > pt[1]) !== (yj > pt[1])) && (pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

export function actForOrder(order: number, acts: any[]) {
  const sorted = [...acts].sort((a, b) => a.startOrder - b.startOrder);
  let res = sorted[0];
  for (const a of sorted) { if (a.startOrder <= order) res = a; else break; }
  return res;
}

export function rootPlaceId(id: string, places: any[]) {
  let cur = places.find((p) => p.id === id);
  const seen = new Set();
  while (cur && cur.parentId && !seen.has(cur.id)) {
    seen.add(cur.id);
    const parent = places.find((p) => p.id === cur.parentId);
    if (!parent) break;
    cur = parent;
  }
  return cur ? cur.id : id;
}

export function dateToPos(year: number | null, month: number, day: number) {
  if (year == null) return null;
  return year * 12 + (month || 1) + (day ? (day - 1) / 31 : 0);
}

export const WORDS_PER_PAGE = 350;
export const pageCount = (wc: number) => (wc <= 0 ? 0 : Math.ceil(wc / WORDS_PER_PAGE));

export const colorForReader = (name: string) => READER_COLORS[hash(name) % READER_COLORS.length];
export const protagColor = (light: boolean) => (light ? "#D4A017" : "#FF3FA4");