import { useEffect, useMemo, useState } from "react";
import type { HistoryItem } from "../api/historyApi";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  initial: HistoryItem | null;
  onClose: () => void;
  onSubmit: (req: { year: number; month: number; content: string; sortOrder: number }) => Promise<void> | void;
};


export default function HistoryUpsertModal({ open, mode, initial, onClose, onSubmit }: Props) {
  const [year, setYear] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("");
  const [content, setContent] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);

  const title = mode === "create" ? "연혁 추가" : "연혁 수정";

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initial) {
      setYear(String(initial.year ?? ""));
      setMonth(String(initial.month ?? ""));
      setSortOrder(String(initial.sortOrder ?? 0));
      setContent(initial.content ?? "");
    } else {
      setYear("");
      setMonth("");
      setSortOrder("");
      setContent("");
    }
  }, [open, mode, initial]);

  const canSubmit = useMemo(() => {
    if (!content.trim()) return false;
    if (!year.trim()) return false;
    if (!month.trim()) return false;
    return true;
  }, [year, month, content]);

  const parseIntOrNull = (v: string) => {
    const t = v.trim();
    if (t === "") return null;
    const n = Number(t);
    if (!Number.isFinite(n)) return null;
    if (!Number.isInteger(n)) return null;
    return n;
  };

  const handleSubmit = async () => {
    if (submitting) return;

    const y = parseIntOrNull(year);
    const m = parseIntOrNull(month);
    const s = sortOrder.trim() === "" ? 0 : parseIntOrNull(sortOrder);

    if (y == null) {
      alert("연도를 입력해주세요.");
      return;
    }
    if (y < 1900 || y > 2200) {
      alert("연도 범위가 올바르지 않습니다. (1900~2200)");
      return;
    }

    if (m == null) {
      alert("월을 입력해주세요.");
      return;
    }
    if (m < 1 || m > 12) {
      alert("월은 1~12만 가능합니다.");
      return;
    }

    if (s == null) {
      alert("정렬 순서는 숫자여야 합니다. (0부터 순서대로)");
      return;
    }
    if (s < 0) {
      alert("정렬 순서는 0 이상이어야 합니다.");
      return;
    }

    const c = content.trim();
    if (!c) {
      alert("내용을 입력해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ year: y, month: m, content: c, sortOrder: s });
      onClose();
    } catch (e) {
      console.warn("연혁 저장 실패", e);
      alert("저장에 실패했습니다. (권한/네트워크 확인)");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
        aria-label="닫기"
      />

      <div className="relative w-[92vw] max-w-3xl bg-white rounded-[2rem] border border-gray-100 shadow-[0_30px_80px_rgba(0,0,0,0.18)] overflow-hidden">
        <div className="p-6 md:p-8 border-b border-gray-100">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black tracking-[0.25em] text-[#813eb6]">HISTORY</p>
              <h2 className="mt-2 text-xl md:text-2xl font-black text-gray-900">{title}</h2>
              <p className="mt-1 text-sm font-bold text-gray-400">
                연도/월/내용을 입력하고 저장하세요.
              </p>
            </div>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-2xl border border-gray-200 text-sm font-black text-gray-600 hover:text-[#813eb6] hover:border-purple-200"
            >
              닫기
            </button>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">연도</label>
              <input
                type="number"
                inputMode="numeric"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="예) 2025"
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-white text-lg font-black text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-200"
              />
            </div>

            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">월</label>
              <input
                type="number"
                inputMode="numeric"
                value={month}
                onChange={(e) => setMonth(e.target.value)} 
                placeholder="1~12"
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-white text-lg font-black text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-black text-gray-700 mb-2">정렬 순서 (같은 달 내)</label>
            <input
              type="number"
              inputMode="numeric"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)} 
              placeholder="0부터 순서대로"
              className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-white text-base font-black text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-200"
            />
            <p className="mt-2 text-xs font-bold text-gray-400">
              같은 연도/월 내에서 작은 값이 먼저 노출됩니다. (0부터 순서대로)
            </p>
          </div>

          <div>
            <label className="block text-sm font-black text-gray-700 mb-2">내용</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="예) 5월 | KT하이오더 - 마케팅 커뮤니케이션 전략 경영PT"
              rows={6}
              className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-white text-base font-bold text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-200 resize-none"
            />
          </div>
        </div>

        <div className="p-6 md:p-8 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-black text-gray-700 hover:text-[#813eb6] hover:border-purple-200"
            disabled={submitting}
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="px-6 py-3 rounded-2xl bg-[#813eb6] text-white text-sm font-black hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}