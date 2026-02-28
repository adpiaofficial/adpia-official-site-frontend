import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
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
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 md:p-10">
          <ReactMarkdown
            components={{
              // 줄바꿈/문단 기본 스타일
              p: ({ node, ...props }) => (
                <p className="text-[15px] md:text-[16px] leading-relaxed text-gray-800 mb-4" {...props} />
              ),
              // 굵게(강조)만 예쁘게
              strong: ({ node, ...props }) => (
                <strong className="font-black text-gray-900" {...props} />
              ),
              // 제목 스타일(혹시 사용하면)
              h1: ({ node, ...props }) => (
                <h1 className="text-xl md:text-2xl font-black text-gray-900 mt-8 mb-4" {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2 className="text-lg md:text-xl font-black text-gray-900 mt-7 mb-3" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="text-base md:text-lg font-black text-gray-900 mt-6 mb-2" {...props} />
              ),
              // 리스트도 혹시 들어오면 보기 좋게
              ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />,
              ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />,
              li: ({ node, ...props }) => (
                <li className="text-[15px] md:text-[16px] leading-relaxed text-gray-800" {...props} />
              ),
              // 구분선
              hr: ({ node, ...props }) => <hr className="my-8 border-gray-200" {...props} />,
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