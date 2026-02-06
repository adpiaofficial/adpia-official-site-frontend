import { useEffect, useMemo, useRef } from "react";
import { renderRichTextToSafeHtml } from "../lib/richText";
import { applyRichTextStyles } from "../lib/richTextStyle";

export default function RichTextView({ value }: { value: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const html = useMemo(() => renderRichTextToSafeHtml(value ?? ""), [value]);

  useEffect(() => {
    applyRichTextStyles(ref.current);
  }, [html]);

  return (
    <div
      ref={ref}
      className="leading-relaxed whitespace-pre-wrap"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
