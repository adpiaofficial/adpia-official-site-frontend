// src/lib/richTextStyle.ts
export function applyRichTextStyles(root: HTMLElement | null) {
  if (!root) return;

  root.querySelectorAll<HTMLElement>("[data-rt-color]").forEach((el) => {
    const c = el.getAttribute("data-rt-color");
    if (c) el.style.setProperty("color", c, "important");
  });

  root.querySelectorAll<HTMLElement>("[data-rt-bg]").forEach((el) => {
    const bg = el.getAttribute("data-rt-bg");
    if (!bg) return;
    el.style.setProperty("backgroundColor", bg, "important");
    el.style.setProperty("padding", "0 4px", "important");
    el.style.setProperty("borderRadius", "4px", "important");
  });

  root.querySelectorAll<HTMLElement>("[data-rt-fs]").forEach((el) => {
    const fs = el.getAttribute("data-rt-fs");
    if (!fs) return;

    // ✅ 핵심: font-size를 강제로 px 적용
    el.style.setProperty("font-size", `${fs}px`, "important");
    el.style.setProperty("line-height", "1.6", "important");
  });
}
