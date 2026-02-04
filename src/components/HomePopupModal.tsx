import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { PopupResponse } from "../api/popupApi";
import RecruitBlockRenderer from "./RecruitBlockRenderer";
import { dismissToday } from "../lib/popupDismiss";

type Props = {
  popup: PopupResponse;
  onClose: () => void;
};

function safeInternalPath(path?: string | null) {
  if (!path) return null;
  if (!path.startsWith("/")) return null;
  return path;
}

export default function HomePopupModal({ popup, onClose }: Props) {
  const navigate = useNavigate();

  const detail = useMemo(() => {
    const label = popup.detailLabel?.trim() || "자세히 보기";
    const type = popup.detailLinkType;

    if (type === "NOTICE" && popup.detailTargetId) {
      return { label, onClick: () => navigate(`/recruit/notice/${popup.detailTargetId}`) };
    }
    if (type === "QA" && popup.detailTargetId) {
      return { label, onClick: () => navigate(`/recruit/qa/${popup.detailTargetId}`) };
    }
    if (type === "PAGE") {
      const to = safeInternalPath(popup.detailUrl);
      if (!to) return null;
      return { label, onClick: () => navigate(to) };
    }
    if (type === "EXTERNAL" && popup.detailUrl) {
      const url = popup.detailUrl;
      return { label, onClick: () => window.open(url, "_blank", "noopener,noreferrer") };
    }
    return null;
  }, [popup, navigate]);

  return (
    <div className="fixed inset-0 z-[200]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-[720px] rounded-[2rem] bg-white shadow-2xl overflow-hidden border border-gray-100">
          {/* header */}
          <div className="px-6 py-5 bg-gradient-to-br from-purple-50 via-white to-white border-b border-gray-100 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-xs font-black text-[#813eb6]">POPUP</div>
              <div className="mt-1 text-xl md:text-2xl font-black text-gray-900 break-keep">{popup.title}</div>
            </div>

            <button
              onClick={onClose}
              className="shrink-0 px-3 py-2 rounded-xl border border-gray-200 text-xs font-black text-gray-600 hover:text-[#813eb6] hover:border-purple-200 transition-all"
            >
              닫기 ✕
            </button>
          </div>

          {/* body */}
          <div className="px-6 py-5 max-h-[60vh] overflow-auto">
            {/* ✅ blocks 그대로 렌더 */}
            <RecruitBlockRenderer blocks={popup.blocks ?? []} />
          </div>

          {/* footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <label className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4"
                onChange={(e) => {
                  if (e.target.checked) dismissToday(popup.id);
                }}
              />
              오늘 보지 않기
            </label>

            <div className="flex items-center justify-end gap-2">
              {detail && (
                <button
                  onClick={detail.onClick}
                  className="px-4 py-2 rounded-xl bg-[#813eb6] text-white text-sm font-black hover:bg-[#6d2aa4] transition-all"
                >
                  {detail.label} →
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-black text-gray-700 hover:text-[#813eb6] hover:border-purple-200 transition-all"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
