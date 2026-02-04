export function normalizeExternalUrl(raw?: string | null): string | null {
  const s = (raw ?? "").trim();
  if (!s) return null;

  const lower = s.toLowerCase();

  // 위험 스킴 차단
  if (lower.startsWith("javascript:") || lower.startsWith("data:") || lower.startsWith("vbscript:")) {
    return null;
  }

  // protocol-relative: //example.com
  if (s.startsWith("//")) return `https:${s}`;

  // 이미 http/https면 그대로
  if (/^https?:\/\//i.test(s)) return s;

  // mailto/tel 허용 (원치 않으면 제거)
  if (/^(mailto:|tel:)/i.test(s)) return s;

  // 프로토콜 없으면 https 붙여서 상대경로 방지
  return `https://${s}`;
}
