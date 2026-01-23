import { fileLabel } from "../lib/blockUtils";

export default function BlockRenderer({
  blocks,
}: {
  blocks: Array<{ type: string; sortOrder: number; text?: string | null; url?: string | null; meta?: string | null }>;
}) {
  const sorted = [...blocks].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-4">
      {sorted.map((b, idx) => {
        if (b.type === "TEXT") {
          return (
            <div key={idx} className="text-sm sm:text-base font-medium text-gray-800 whitespace-pre-wrap leading-relaxed">
              {b.text}
            </div>
          );
        }

        if (b.type === "IMAGE" && b.url) {
          return (
            <a key={idx} href={b.url} target="_blank" rel="noreferrer" className="block">
              <img
                src={b.url}
                alt="image"
                className="w-full max-h-[520px] object-contain rounded-2xl border border-gray-100 bg-white"
                loading="lazy"
              />
              <div className="mt-2 text-xs font-bold text-gray-400">클릭하면 원본 보기</div>
            </a>
          );
        }

        if (b.type === "VIDEO" && b.url) {
          return (
            <div key={idx} className="space-y-2">
              <video src={b.url} controls className="w-full rounded-2xl border border-gray-100 bg-black" />
              <div className="text-xs font-bold text-gray-400">영상</div>
            </div>
          );
        }

        if (b.type === "FILE" && b.url) {
          return (
            <a
              key={idx}
              href={b.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 hover:border-purple-200"
            >
              <div className="min-w-0">
                <div className="text-sm font-black text-gray-800 truncate">{fileLabel(b.url)}</div>
                <div className="text-[11px] font-bold text-gray-400">다운로드 / 새 탭 열기</div>
              </div>
              <div className="text-xs font-black text-[#813eb6]">OPEN</div>
            </a>
          );
        }

        // EMBED/LINK 등은 추후 확장
        if ((b.type === "LINK" || b.type === "EMBED") && b.url) {
          return (
            <a key={idx} href={b.url} target="_blank" rel="noreferrer" className="text-sm font-black text-[#813eb6] underline">
              {b.url}
            </a>
          );
        }

        return (
          <div key={idx} className="text-xs font-bold text-gray-400">
            지원되지 않는 블록: {b.type}
          </div>
        );
      })}
    </div>
  );
}
