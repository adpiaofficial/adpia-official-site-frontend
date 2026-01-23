// src/lib/blockUtils.ts
import type { RecruitBlockRequest, RecruitBlockType } from "../api/recruitApi";

/** blocks.sortOrder를 0..n-1로 재정렬 */
export function normalizeSortOrder(blocks: RecruitBlockRequest[]): RecruitBlockRequest[] {
  return blocks.map((b, idx) => ({ ...b, sortOrder: idx }));
}

/** 배열 원소 이동 */
export function moveItem<T>(arr: T[], from: number, to: number) {
  const next = [...arr];
  const [picked] = next.splice(from, 1);
  next.splice(to, 0, picked);
  return next;
}

/** mime으로 블록 타입 추론 (파일 업로드용) */
export function inferBlockTypeByMime(mime: string): Extract<RecruitBlockType, "IMAGE" | "VIDEO" | "FILE"> {
  if (mime.startsWith("image/")) return "IMAGE";
  if (mime.startsWith("video/")) return "VIDEO";
  return "FILE";
}

/** fileUrl에서 파일명 추출 */
export function fileLabel(fileUrl: string) {
  try {
    const u = new URL(fileUrl);
    const name = decodeURIComponent(u.pathname.split("/").pop() || "file");
    return name;
  } catch {
    return "file";
  }
}

/** meta(json string) 안전 파싱 */
export function parseBlockMeta(meta?: string | null): any | null {
  if (!meta) return null;
  try {
    return JSON.parse(meta);
  } catch {
    return null;
  }
}
