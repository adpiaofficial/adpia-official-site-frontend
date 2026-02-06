import { downloadWithPresign } from "../lib/downloadWithPresign";
import { normalizeExternalUrl } from "../lib/url";

function parseMeta(meta?: string | null) {
  if (!meta) return null;
  try {
    return JSON.parse(meta);
  } catch {
    return null;
  }
}

export default function BlockRenderer({
  blocks,
}: {
  blocks: Array<{ type: string; sortOrder: number; text?: string | null; url?: string | null; meta?: string | null }>;
}) {
  const sorted = [...blocks].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-4">
      {sorted.map((b, idx) => {
        const url = normalizeExternalUrl(b.url ?? "") ?? (b.url ?? "");
        const meta = parseMeta(b.meta);
        
        // [체크용 로그] 모든 블록의 타입을 화면에 작게 표시합니다.
        console.log(`Block ${idx} type:`, b.type);

        return (
          <div key={idx} className="relative border-l-4 border-purple-200 pl-4 py-2">
            <span className="text-[10px] text-gray-400 absolute -top-3 left-0">Type: {b.type}</span>

            {b.type === "TEXT" && (
              <div className="text-sm text-gray-800 whitespace-pre-wrap">{b.text}</div>
            )}

            {/* 모든 파일/링크/이미지를 하나의 다운로드 로직으로 통합 테스트 */}
            {(b.type === "FILE" || b.type === "IMAGE" || b.type === "VIDEO" || b.type === "LINK" || b.type === "EMBED") && url && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="min-w-0">
                  <div className="text-sm font-bold truncate">{meta?.originalFilename || "이름 없음"}</div>
                  <div className="text-[10px] text-gray-400 truncate">{url}</div>
                </div>
                
                <button
                  type="button"
                  className="bg-[#813eb6] text-white px-4 py-2 rounded-lg text-xs font-bold"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("!!! 버튼 클릭 감지 !!!");
                    console.log("전달할 데이터:", { url, meta });
                    alert(`클릭됨! 파일명: ${meta?.originalFilename}`);
                    void downloadWithPresign(url, meta);
                  }}
                >
                  다운로드
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}