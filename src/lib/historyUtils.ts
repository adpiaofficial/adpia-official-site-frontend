import type { HistoryItem } from "../api/historyApi";

export function currentDecade() {
  const year = new Date().getFullYear();
  return Math.floor(year / 10) * 10;
}

export function decadeLabel(decade: number) {
  if (decade === 1990) return "1992~1999";
  return `${decade}년대`;
}

export function groupByYear(items: HistoryItem[]) {
  const map = new Map<number, HistoryItem[]>();
  for (const it of items) {
    const arr = map.get(it.year) ?? [];
    arr.push(it);
    map.set(it.year, arr);
  }
  const years = Array.from(map.keys()).sort((a, b) => b - a);

  for (const y of years) {
    map.get(y)!.sort((a, b) => (a.month - b.month) || (a.sortOrder - b.sortOrder));
  }
  return { years, map };
}