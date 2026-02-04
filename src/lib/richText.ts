// src/lib/richText.ts
type Token =
  | { type: "text"; value: string }
  | { type: "open"; name: "c" | "bg" | "fs" | "b"; value?: string }
  | { type: "close"; name: "c" | "bg" | "fs" | "b" };

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function isHexColor(v?: string) {
  return !!v && /^#([0-9a-fA-F]{6})$/.test(v);
}

function clampFontSize(v?: string) {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  const clamped = Math.max(12, Math.min(28, Math.round(n)));
  return String(clamped);
}

/**
 * 지원 토큰
 * - 굵게: {b}...{/b}  + (호환) **...**
 * - 글자색: {c:#RRGGBB}...{/c}
 * - 하이라이트: {bg:#RRGGBB}...{/bg}
 * - 폰트크기: {fs:18}...{/fs} (12~28)
 */
function tokenize(input: string): Token[] {
  const s = input ?? "";
  const tokens: Token[] = [];

  // 단순 파서: {name:value} / {/name} / **bold**
  // **는 토큰화 전에 {b}{/b}로 변환해서 처리
  let normalized = s;

  // **bold** (가장 단순한 형태만 지원, 중첩 완벽 지원은 아님)
  // 에디터에서 버튼으로 넣는 용도라 이 정도면 충분
  normalized = normalized.replace(/\*\*(.+?)\*\*/g, "{b}$1{/b}");

  const re = /(\{\/?(?:c|bg|fs|b)(?::[^}]+)?\})/g;
  const parts = normalized.split(re);

  for (const part of parts) {
    if (!part) continue;

    const mOpen = part.match(/^\{(c|bg|fs|b)(?::([^}]+))?\}$/);
    if (mOpen) {
      tokens.push({ type: "open", name: mOpen[1] as any, value: mOpen[2] });
      continue;
    }

    const mClose = part.match(/^\{\/(c|bg|fs|b)\}$/);
    if (mClose) {
      tokens.push({ type: "close", name: mClose[1] as any });
      continue;
    }

    tokens.push({ type: "text", value: part });
  }

  return tokens;
}

export function renderRichTextToSafeHtml(input: string) {
  const tokens = tokenize(input);

  // 스택 기반으로 태그 생성
  let html = "";
  const stack: Array<"c" | "bg" | "fs" | "b"> = [];

  const openTag = (name: "c" | "bg" | "fs" | "b", value?: string) => {
    if (name === "b") {
      html += `<strong data-rt-b="1">`;
      stack.push("b");
      return;
    }

    if (name === "c") {
      const color = isHexColor(value) ? value : null;
      html += `<span data-rt-color="${color ?? ""}">`;
      stack.push("c");
      return;
    }

    if (name === "bg") {
      const bg = isHexColor(value) ? value : null;
      html += `<span data-rt-bg="${bg ?? ""}">`;
      stack.push("bg");
      return;
    }

    if (name === "fs") {
      const fs = clampFontSize(value) ?? "";
      html += `<span data-rt-fs="${fs}">`;
      stack.push("fs");
      return;
    }
  };

  const closeTag = (name: "c" | "bg" | "fs" | "b") => {
    // 잘못 닫는 케이스가 있어도 최대한 복구
    // 스택 top부터 name 찾을 때까지 닫고 다시 열어주는 방식은 복잡하니,
    // 여기서는 "name이 스택에 존재하면 그 name까지 닫기" 정도로 처리
    const idx = stack.lastIndexOf(name);
    if (idx === -1) return;

    for (let i = stack.length - 1; i >= idx; i--) {
      const n = stack.pop();
      if (!n) continue;
      html += n === "b" ? `</strong>` : `</span>`;
    }
  };

  for (const t of tokens) {
    if (t.type === "text") {
      // 줄바꿈 유지
      html += escapeHtml(t.value).replaceAll("\n", "<br/>");
    } else if (t.type === "open") {
      openTag(t.name, t.value);
    } else if (t.type === "close") {
      closeTag(t.name);
    }
  }

  // 남은 태그 닫기
  while (stack.length) {
    const n = stack.pop();
    html += n === "b" ? `</strong>` : `</span>`;
  }

  return html;
}
