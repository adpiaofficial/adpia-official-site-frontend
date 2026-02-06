import { useEffect, useMemo, useState } from "react";
import type { RecruitBlockResponse } from "../api/recruitApi";
import { parseBlockMeta } from "../lib/blockUtils";
import { normalizeExternalUrl } from "../lib/url";
import RichTextView from "./RichTextView";
// 1. 다운로드 유틸리티를 불러옵니다.
import { downloadWithPresign } from "../lib/downloadWithPresign";

type LinkPreview = {
  title?: string | null;
  description?: string | null;
  image?: string | null;
  siteName?: string | null;
};

function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);

    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "").trim();
      return id ? id : null;
    }

    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;

      const m1 = u.pathname.match(/\/shorts\/([^/?]+)/);
      if (m1?.[1]) return m1[1];

      const m2 = u.pathname.match(/\/embed\/([^/?]+)/);
      if (m2?.[1]) return m2[1];
    }

    return null;
  } catch {
    return null;
  }
}

function getYouTubeEmbedUrl(originalUrl: string): string | null {
  const id = extractYouTubeId(originalUrl);
  if (!id) return null;
  return `https://www.youtube.com/embed/${id}`;
}

function getYouTubeThumbUrl(originalUrl: string): string | null {
  const id = extractYouTubeId(originalUrl);
  if (!id) return null;
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

function canIframe(url: string) {
  if (getYouTubeEmbedUrl(url)) return true;
  if (/google\.com\/maps/i.test(url)) return true;
  return false;
}

async function fetchLinkPreview(url: string): Promise<LinkPreview | null> {
  const safe = normalizeExternalUrl(url);
  if (!safe) return null;

  try {
    const res = await fetch(`/api/link/preview?url=${encodeURIComponent(safe)}`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as LinkPreview;
    return data ?? null;
  } catch {
    return null;
  }
}

function LinkCard({ url, meta }: { url: string; meta?: any }) {
  const ytThumb = useMemo(() => getYouTubeThumbUrl(url), [url]);
  const ytTitle = useMemo(() => meta?.title ?? url, [meta, url]);

  const [preview, setPreview] = useState<LinkPreview | null>(null);

  useEffect(() => {
    const hasEnough = !!(meta?.title || meta?.desc || meta?.image);
    if (hasEnough) return;

    let alive = true;
    (async () => {
      const p = await fetchLinkPreview(url);
      if (!alive) return;
      setPreview(p);
    })();

    return () => {
      alive = false;
    };
  }, [url, meta]);

  const title = meta?.title ?? preview?.title ?? ytTitle;
  const desc = meta?.desc ?? preview?.description ?? meta?.description ?? null;
  const image = meta?.image ?? preview?.image ?? ytThumb ?? null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-2xl border border-gray-100 bg-white overflow-hidden hover:border-purple-200 transition-all"
    >
      <div className="bg-gray-50 border-b border-gray-100">
        {image ? (
          <img
            src={image}
            alt=""
            className="w-full h-52 object-cover"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="h-52 flex items-center justify-center text-xs font-bold text-gray-400">미리보기 없음</div>
        )}
      </div>

      <div className="p-4">
        <div className="text-sm font-black text-gray-900 line-clamp-2">{title}</div>
        {desc && <div className="mt-1 text-xs font-bold text-gray-500 line-clamp-2">{desc}</div>}
        <div className="mt-2 text-xs font-black text-[#813eb6] break-all">{url}</div>
      </div>
    </a>
  );
}

export default function RecruitBlockRenderer({ blocks }: { blocks: RecruitBlockResponse[] }) {
  const sorted = useMemo(
    () => [...(blocks ?? [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [blocks]
  );

  return (
    <div className="space-y-4">
      {sorted.map((b, idx) => {
        const meta = parseBlockMeta(b.meta);
        const url = normalizeExternalUrl(b.url);

        if (b.type === "TEXT") {
          const text = (b.text ?? "").trim();
          if (!text) return null;

          return (
            <div key={idx} className="text-gray-800 text-[15px] font-medium leading-relaxed">
              <RichTextView value={text} />
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

          const ytEmbed = getYouTubeEmbedUrl(url);
          if (ytEmbed) {
            return (
              <div key={idx} className="rounded-2xl border border-gray-100 bg-black overflow-hidden">
                <div className="relative w-full pt-[56.25%]">
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={ytEmbed}
                    title="youtube"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            );
          }

          return (
            <div key={idx} className="rounded-2xl border border-gray-100 bg-black overflow-hidden">
              <video controls className="w-full">
                <source src={url} />
              </video>
            </div>
          );
        }

        if (b.type === "EMBED") {
          if (!url) return null;

          if (!canIframe(url)) {
            return (
              <div key={idx}>
                <LinkCard url={url} meta={meta} />
              </div>
            );
          }

          const ytEmbed = getYouTubeEmbedUrl(url);
          const iframeSrc = ytEmbed ?? url;

          return (
            <div key={idx} className="rounded-2xl border border-gray-100 overflow-hidden bg-white">
              <div className="relative w-full pt-[56.25%]">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={iframeSrc}
                  title="embed"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          );
        }

        if (b.type === "LINK") {
          if (!url) return null;
          return (
            <div key={idx}>
              <LinkCard url={url} meta={meta} />
            </div>
          );
        }

        // 2. 핵심 수정 부분: FILE 타입 로직
        if (b.type === "FILE") {
          if (!url) return null;

          const fileName = meta?.fileName ?? meta?.originalFilename ?? url.split("/").pop() ?? "download";
          const fileSize = meta?.fileSize ?? meta?.size;

          return (
            <div
              key={idx}
              className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 hover:border-purple-200 transition-all cursor-pointer"
              onClick={() => {
                // 다운로드 유틸리티 함수를 호출합니다.
                void downloadWithPresign(url, {
                  key: meta?.key,
                  contentType: meta?.contentType,
                  originalFilename: fileName,
                });
              }}
            >
              <div className="min-w-0">
                <div className="text-sm font-black text-gray-900 truncate">📎 {fileName}</div>
                <div className="mt-1 text-xs font-bold text-gray-500 truncate">
                  {fileSize ? `size: ${fileSize}` : "파일 다운로드"}
                </div>
              </div>
              <div className="shrink-0 text-xs font-black text-[#813eb6]">Download →</div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}