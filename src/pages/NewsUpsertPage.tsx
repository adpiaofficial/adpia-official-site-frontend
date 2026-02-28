import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { RecruitBlockRequest, RecruitPostUpsertRequest, RecruitPost } from "../api/recruitApi";
import { normalizeSortOrder } from "../lib/blockUtils";
import BlockEditor from "../components/BlockEditor";
import useS3Upload from "../hooks/useS3Upload";
import { createNewsPost, getNewsPost, updateNewsPost } from "../api/newsApi";

type Props = { mode: "create" | "edit" };

function isAdminRole(role?: string | null) {
  return role === "ROLE_SUPER_ADMIN" || role === "ROLE_PRESIDENT";
}

function handleHttpError(e: unknown, navigate: (to: string, opt?: any) => void) {
  const anyErr = e as any;
  const status = anyErr?.response?.status;
  if (status === 401) return alert("로그인이 필요합니다."), navigate("/login");
  if (status === 403) return alert("권한이 없습니다.");
  alert(anyErr?.response?.data?.message || "요청 처리 중 오류가 발생했습니다.");
}

export default function NewsUpsertPage({ mode }: Props) {
  const navigate = useNavigate();
  const { id } = useParams();

  const routePostId = useMemo(() => Number(id), [id]);
  const { user, loading: authLoading } = useAuth();
  const uploader = useS3Upload();

  const canEdit = isAdminRole(user?.role);

  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);

  // ✅ post state가 필요 없으면 제거(경고 제거)
  const [title, setTitle] = useState("");
  const [pinned, setPinned] = useState(false);
  const [blocks, setBlocks] = useState<RecruitBlockRequest[]>([
    { type: "TEXT", sortOrder: 0, text: "" },
  ]);

  // ✅ 권한 체크
  useEffect(() => {
    if (authLoading) return;
    if (!canEdit) {
      alert("권한이 없습니다.");
      navigate("/about/news", { replace: true });
    }
  }, [authLoading, canEdit, navigate]);

  // ✅ edit 로드
  useEffect(() => {
    if (mode !== "edit") return;
    if (!Number.isFinite(routePostId)) return;

    void (async () => {
      setLoading(true);
      try {
        const data: RecruitPost = await getNewsPost(routePostId);

        setTitle(data.title);
        setPinned(!!data.pinned);

        const mapped: RecruitBlockRequest[] = (data.blocks ?? [])
          .slice()
          .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)) // ✅ a/b any 에러 회피
          .map((b: any) => ({
            type: b.type,
            sortOrder: b.sortOrder,
            text: b.text ?? undefined,
            url: b.url ?? undefined,
            meta: b.meta ?? undefined,
          }));

        setBlocks(mapped.length ? mapped : [{ type: "TEXT", sortOrder: 0, text: "" }]);
      } catch (e) {
        handleHttpError(e, navigate);
      } finally {
        setLoading(false);
      }
    })();
  }, [mode, routePostId, navigate]);

  const onSubmit = async () => {
    if (!title.trim()) return alert("제목을 입력해주세요.");
    if (uploader.isUploading) return alert("파일 업로드가 끝난 뒤 저장할 수 있어요.");
    if (!canEdit) return alert("권한이 없습니다.");

    const normalized = normalizeSortOrder(blocks)
      .filter((b) => (b.type === "TEXT" ? (b.text ?? "").trim().length > 0 : !!(b.url && b.url.trim())))
      .map((b) => ({
        ...b,
        text: b.type === "TEXT" ? (b.text ?? "") : undefined,
        url: b.type !== "TEXT" ? (b.url ?? "") : undefined,
      }));

    const req: RecruitPostUpsertRequest = {
      title: title.trim(),
      pinned,
      blocks: normalized,
      secret: false,
    };

    setSaving(true);
    try {
      if (mode === "create") {
        const created = await createNewsPost(req);
        navigate(`/about/news/${created.id}`, { replace: true });
      } else {
        await updateNewsPost(routePostId, req);
        navigate(`/about/news/${routePostId}`, { replace: true });
      }
    } catch (e) {
      handleHttpError(e, navigate);
    } finally {
      setSaving(false);
    }
  };

  const pageTitle = mode === "create" ? "보도자료 작성" : "보도자료 수정";
  const ready = !(loading || authLoading);

  return (
    <div className="pt-24 md:pt-28 max-w-5xl mx-auto px-4 sm:px-6 pb-24 font-paperlogy">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-xs font-black text-[#813eb6]">
              ADPIA
            </span>
            <span className="text-xs font-black text-gray-400">보도자료</span>
          </div>
          <h1 className="mt-2 text-2xl md:text-3xl font-black text-gray-900">{pageTitle}</h1>
        </div>

        <button
          onClick={() => navigate("/about/news")}
          className="shrink-0 px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-black text-gray-600 hover:text-[#813eb6] hover:border-purple-200 transition-all"
        >
          목록으로
        </button>
      </div>

      {!ready ? (
        <div className="mt-6 bg-white border border-gray-100 rounded-2xl shadow-sm p-6 text-sm font-bold text-gray-400">
          준비 중...
        </div>
      ) : (
        <>
          <div className="mt-6 bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-5 md:p-6 border-b border-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-8">
                  <div className="text-xs font-black text-gray-400 mb-2">TITLE</div>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="제목을 입력하세요"
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-200"
                  />
                </div>

                <div className="md:col-span-4 flex items-center justify-between md:justify-end gap-4 md:mt-6">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={pinned}
                      onChange={(e) => setPinned(e.target.checked)}
                      className="scale-110"
                    />
                    <span className="text-sm font-black text-gray-700">⭐ 상단 고정</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            {/* ✅ 이제 RecruitBoardCode에 NEWS 넣었으면 타입 에러 사라짐 */}
            <BlockEditor boardCode="NEWS" postId={mode === "edit" ? routePostId : 0} value={blocks} onChange={setBlocks} disabled={saving} />
          </div>

          <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-end gap-2">
            <button
              onClick={() => navigate("/about/news")}
              className="px-5 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-black text-gray-600 hover:text-[#813eb6] hover:border-purple-200 transition-all"
            >
              취소
            </button>
            <button
              disabled={saving || uploader.isUploading}
              onClick={onSubmit}
              className="px-6 py-3 rounded-2xl bg-[#813eb6] text-white text-sm font-black shadow-lg shadow-purple-100 hover:bg-[#3d1d56] transition-all disabled:opacity-60"
            >
              {uploader.isUploading ? "업로드 중..." : saving ? "저장중..." : "저장"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}