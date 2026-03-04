import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

import { useAuth } from "../contexts/AuthContext";
import RulesUpsertModal from "../components/RulesUpsertModal";
import { getRules, upsertRules, type RulesDoc } from "../api/rulesApi";

function isAdmin(role?: string | null) {
  return role === "ROLE_SUPER_ADMIN" || role === "ROLE_PRESIDENT";
}

export default function RulesPage() {
  const { user, loading: authLoading } = useAuth();
  const canEdit = isAdmin(user?.role);

  const [doc, setDoc] = useState<RulesDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchDoc = async () => {
    setLoading(true);
    try {
      const data = await getRules();
      setDoc(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoc();
  }, []);

  const submit = async (content: string) => {
    if (!canEdit) return alert("권한이 없습니다.");
    await upsertRules({ content });
    await fetchDoc();
  };

  const pageLoading = loading || authLoading;

  return (
    <div className="pt-24 md:pt-28 max-w-5xl mx-auto px-4 sm:px-6 pb-24 font-paperlogy">
      {/* Title */}
      <div className="text-center mb-14">
        <p className="tracking-[0.3em] text-[#813eb6] text-sm font-black">RULES</p>
        <h1 className="text-3xl md:text-5xl font-black mt-4 text-gray-900">애드피아 회칙</h1>
        <div className="w-16 h-[2px] bg-[#813eb6] mx-auto mt-6" />

        {canEdit && (
          <div className="mt-6 flex items-center justify-center">
            <button
              onClick={() => setModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-[#813eb6] text-white text-sm font-black hover:opacity-90"
            >
              회칙 수정
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {pageLoading ? (
        <div className="space-y-3">
          <div className="h-32 rounded-3xl border border-gray-100 bg-white shadow-sm animate-pulse" />
          <div className="h-32 rounded-3xl border border-gray-100 bg-white shadow-sm animate-pulse" />
          <div className="h-32 rounded-3xl border border-gray-100 bg-white shadow-sm animate-pulse" />
        </div>
      ) : !doc?.content?.trim() ? (
        <div className="text-sm font-bold text-gray-400 bg-white border border-gray-100 rounded-2xl p-6">
          회칙이 없습니다.
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 md:p-10 font-paperlogy">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]} // ✅ 단일 줄바꿈도 <br/>로 반영
            components={{
              // 문단
              p: ({ ...props }) => (
                <p
                  className="text-[15px] md:text-[16px] leading-relaxed text-gray-800 mb-4 whitespace-pre-wrap"
                  {...props}
                />
              ),
              // 줄바꿈 태그 (remark-breaks가 만들어줌)
              br: ({ ...props }) => <br {...props} />,
              // 굵게
              strong: ({ ...props }) => <strong className="font-black text-gray-900" {...props} />,
              // 제목(마크다운 # ## ### 쓰면 자동 적용)
              h1: ({ ...props }) => <h1 className="text-xl md:text-2xl font-black text-gray-900 mt-8 mb-4" {...props} />,
              h2: ({ ...props }) => <h2 className="text-lg md:text-xl font-black text-gray-900 mt-7 mb-3" {...props} />,
              h3: ({ ...props }) => <h3 className="text-base md:text-lg font-black text-gray-900 mt-6 mb-2" {...props} />,
              // 리스트
              ul: ({ ...props }) => <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />,
              ol: ({ ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />,
              li: ({ ...props }) => (
                <li className="text-[15px] md:text-[16px] leading-relaxed text-gray-800 whitespace-pre-wrap" {...props} />
              ),
              hr: ({ ...props }) => <hr className="my-8 border-gray-200" {...props} />,
            }}
          >
            {doc.content}
          </ReactMarkdown>
        </div>
      )}

      <RulesUpsertModal
        open={modalOpen}
        initialContent={doc?.content ?? ""}
        onClose={() => setModalOpen(false)}
        onSubmit={submit}
      />
    </div>
  );
}