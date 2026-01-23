import type { RecruitBlockResponse } from "../api/recruitApi";
import { parseBlockMeta } from "../lib/blockUtils";

function isYouTube(url: string) {
  return /youtube\.com|youtu\.be/.test(url);
}

function safeUrl(url?: string | null) {
  if (!url) return null;
  return url;
}

export default function RecruitBlockRenderer({ blocks }: { blocks: RecruitBlockResponse[] }) {
  const sorted = [...(blocks ?? [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  return (
    <div className="space-y-4">
      {sorted.map((b, idx) => {
        const meta = parseBlockMeta(b.meta);
        const url = safeUrl(b.url);

        if (b.type === "TEXT") {
          const text = (b.text ?? "").trim();
          if (!text) return null;
          return (
            <div key={idx} className="text-gray-800 leading-relaxed whitespace-pre-wrap text-[15px] font-medium">
              {text}
            </div>
          );
        }

        if (b.type === "IMAGE") {
          if (!url) return null;
          return (
            <figure key={idx} className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
              <img src={url} alt="" className="w-full h-auto object-cover" />
              {meta?.caption && (
                <figcaption className="px-4 py-3 text-xs font-bold text-gray-500">{meta.caption}</figcaption>
              )}
            </figure>
          );
        }

        if (b.type === "VIDEO") {
          if (!url) return null;

          // 1) embedUrl meta 있으면 그걸 우선
          const embedUrl = meta?.embedUrl ?? (isYouTube(url) ? url : null);

          return (
            <div key={idx} className="rounded-2xl border border-gray-100 bg-black overflow-hidden">
              {embedUrl ? (
                <div className="relative w-full pt-[56.25%]">
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={embedUrl}
                    title="video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <video controls className="w-full">
                  <source src={url} />
                </video>
              )}
            </div>
          );
        }

        if (b.type === "EMBED") {
          if (!url) return null;
          return (
            <div key={idx} className="rounded-2xl border border-gray-100 overflow-hidden bg-white">
              <div className="relative w-full pt-[56.25%]">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={url}
                  title="embed"
                  allow="clipboard-write; encrypted-media; picture-in-picture"
                />
              </div>
            </div>
          );
        }

        if (b.type === "LINK") {
          if (!url) return null;
          const title = meta?.title ?? url;
          const desc = meta?.desc;

          return (
            <a
              key={idx}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="block rounded-2xl border border-gray-100 bg-white p-4 hover:border-purple-200 transition-all"
            >
              <div className="text-sm font-black text-gray-900 line-clamp-2">{title}</div>
              {desc && <div className="mt-1 text-xs font-bold text-gray-500 line-clamp-2">{desc}</div>}
              <div className="mt-2 text-xs font-black text-[#813eb6] break-all">{url}</div>
            </a>
          );
        }

        if (b.type === "FILE") {
          if (!url) return null;
          const fileName = meta?.fileName ?? url.split("/").pop() ?? "download";
          const fileSize = meta?.fileSize;

          return (
            <a
              key={idx}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 hover:border-purple-200 transition-all"
            >
              <div className="min-w-0">
                <div className="text-sm font-black text-gray-900 truncate">📎 {fileName}</div>
                <div className="mt-1 text-xs font-bold text-gray-500 truncate">
                  {fileSize ? `size: ${fileSize}` : "파일 다운로드"}
                </div>
              </div>
              <div className="shrink-0 text-xs font-black text-[#813eb6]">Download →</div>
            </a>
          );
        }

        return null;
      })}
    </div>
  );
}
