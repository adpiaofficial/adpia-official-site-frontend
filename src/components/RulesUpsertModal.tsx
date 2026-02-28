// src/components/RulesUpsertModal.tsx
import { useEffect, useMemo, useState } from "react";

type Props = {
  open: boolean;
  initialContent: string;
  onClose: () => void;
  onSubmit: (content: string) => Promise<void> | void;
};

export default function RulesUpsertModal({ open, initialContent, onClose, onSubmit }: Props) {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setContent(initialContent ?? "");
  }, [open, initialContent]);

  const disabled = useMemo(() => saving, [saving]);

  if (!open) return null;

  const submit = async () => {
    setSaving(true);
    try {
      await onSubmit(content);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden font-paperlogy">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-xs font-black tracking-[0.25em] text-[#813eb6]">RULES</div>
            <div className="text-lg md:text-xl font-black text-gray-900 mt-1">회칙 수정</div>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-2xl border border-gray-200 bg-white text-sm font-black text-gray-600 hover:text-[#813eb6] hover:border-purple-200"
            disabled={disabled}
          >
            닫기
          </button>
        </div>

        <div className="px-6 py-6">
          <label className="block text-sm font-black text-gray-700 mb-2">내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={"예) **강조 텍스트** 로 굵게 표시할 수 있어요.\n\n제1조(명칭)\n본 회는 ..."}
            className="w-full min-h-[380px] rounded-2xl border border-gray-200 bg-white p-4 text-sm font-semibold text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-200 whitespace-pre-wrap"
          />

          <div className="mt-3 text-xs text-gray-400 font-semibold">
            ✅ 굵게 강조: <span className="font-black text-gray-600">**텍스트**</span>
          </div>
        </div>

        <div className="px-6 py-5 border-t border-gray-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={disabled}
            className="px-5 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-black text-gray-700 hover:text-[#813eb6] hover:border-purple-200 disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={submit}
            disabled={disabled}
            className="px-5 py-3 rounded-2xl bg-[#813eb6] text-white text-sm font-black hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}