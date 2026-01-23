import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { RecruitBlockRequest, RecruitPostUpsertRequest } from "../api/recruitApi";
import { createRecruitPost, getRecruitPost, updateRecruitPost } from "../api/recruitApi";
import { normalizeSortOrder } from "../lib/blockUtils";
import BlockEditor from "../components/BlockEditor";
import useS3Upload from "../hooks/useS3Upload";

type Props = { mode: "create" | "edit" };

function canWriteNotice(role?: string | null) {
  return role === "ROLE_SUPER_ADMIN" || role === "ROLE_PRESIDENT";
}

function handleHttpError(e: any, navigate: (to: string) => void) {
  const status = e?.response?.status;
  if (status === 401) return alert("로그인이 필요합니다."), navigate("/login");
  if (status === 403) return alert("권한이 없습니다.");
  alert(e?.response?.data?.message || "요청 처리 중 오류가 발생했습니다.");
}

export default function NoticeUpsertPage({ mode }: Props) {
  const navigate = useNavigate();
  const { id } = useParams();
  const routePostId = useMemo(() => Number(id), [id]);

  const { user, loading: authLoading } = useAuth();
  const uploader = useS3Upload();

  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);

  // ✅ create 모드에서는 draft 생성 후 여기 저장
  const [draftId, setDraftId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [pinned, setPinned] = useState(false);
  const [blocks, setBlocks] = useState<RecruitBlockRequest[]>([{ type: "TEXT", sortOrder: 0, text: "" }]);

  const postId = mode === "edit" ? routePostId : draftId;

  // ✅ 권한 체크
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      alert("로그인이 필요합니다.");
      navigate("/login", { replace: true });
      return;
    }

    if (!canWriteNotice(user.role)) {
      alert("권한이 없습니다.");
      navigate("/recruit/notice", { replace: true });
      return;
    }
  }, [authLoading, user, navigate]);

  // ✅ edit 로드
  useEffect(() => {
    if (mode !== "edit") return;
    if (!Number.isFinite(routePostId)) return;

    void (async () => {
      setLoading(true);
      try {
        const post = await getRecruitPost(routePostId);
        setTitle(post.title);
        setPinned(post.pinned);

        const mapped = (post.blocks ?? [])
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((b) => ({
            type: b.type,
            sortOrder: b.sortOrder,
            text: b.text ?? undefined,
            url: b.url ?? undefined,
            meta: b.meta ?? undefined,
          }));

        setBlocks(mapped.length ? mapped : [{ type: "TEXT", sortOrder: 0, text: "" }]);
      } catch (e: any) {
        handleHttpError(e, navigate);
      } finally {
        setLoading(false);
      }
    })();
  }, [mode, routePostId, navigate]);

  // ✅ A안: create 모드일 때 draft 먼저 생성 (처음부터 만들고 싶으면 이 useEffect 켜두면 됨)
  useEffect(() => {
    if (mode !== "create") return;
    if (authLoading) return;
    if (!user) return;
    if (draftId != null) return;

    void (async () => {
      try {
        // 제목 없더라도 임시로 생성(서버가 NotBlank면 기본값 넣어주기)
        const initialTitle = title.trim() || "임시 공지";
        const created = await createRecruitPost("NOTICE", {
          title: initialTitle,
          pinned: false,
        //   blocks: [{ type: "TEXT", sortOrder: 0, text: "" }],
        });
        setDraftId(created.id);
        // draft 제목이 "임시 공지"면 사용자 입력이 없을 때만 반영
        if (!title.trim()) setTitle(initialTitle);
      } catch (e: any) {
        handleHttpError(e, navigate);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, authLoading, user]);

  const onSubmit = async () => {
    if (!title.trim()) return alert("제목을 입력해주세요.");

    if (uploader.isUploading) {
      alert("파일 업로드가 끝난 뒤 저장할 수 있어요.");
      return;
    }

    if (!postId) {
      alert("게시글 ID 생성 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    // blocks 정리
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
    };

    setSaving(true);
    try {
      // ✅ A안: 최종 저장은 PATCH로 통일
      await updateRecruitPost(postId, req);
      navigate(`/recruit/notice/${postId}`, { replace: true });
    } catch (e: any) {
      handleHttpError(e, navigate);
    } finally {
      setSaving(false);
    }
  };

  const pageTitle = mode === "create" ? "공지 작성" : "공지 수정";

  return (
    <div className="pt-24 md:pt-28 max-w-5xl mx-auto px-4 sm:px-6 pb-24">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-xs font-black text-[#813eb6]">
              Recruit
            </span>
            <span className="text-xs font-black text-gray-400">NOTICE</span>
          </div>
          <h1 className="mt-2 text-2xl md:text-3xl font-black text-gray-900">{pageTitle}</h1>
          <p className="mt-1 text-sm font-bold text-gray-500">
            카드형 블록 에디터로 글/이미지/영상/PDF를 원하는 순서로 구성하세요.
          </p>
        </div>

        <button
          onClick={() => navigate("/recruit/notice")}
          className="shrink-0 px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-black text-gray-600 hover:text-[#813eb6] hover:border-purple-200 transition-all"
        >
          목록으로
        </button>
      </div>

      {(loading || authLoading || (mode === "create" && postId == null)) ? (
        <div className="mt-6 bg-white border border-gray-100 rounded-2xl shadow-sm p-6 text-sm font-bold text-gray-400">
          준비 중...
        </div>
      ) : (
        <>
          {/* 상단 입력 카드 */}
          <div className="mt-6 bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-5 md:p-6 border-b border-gray-50">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex-1">
                  <div className="text-xs font-black text-gray-400 mb-2">TITLE</div>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="공지 제목을 입력하세요"
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-200"
                  />
                </div>

                <label className="inline-flex items-center gap-2 md:mt-6">
                  <input
                    type="checkbox"
                    checked={pinned}
                    onChange={(e) => setPinned(e.target.checked)}
                    className="scale-110"
                  />
                  <span className="text-sm font-black text-gray-700">📌 상단 고정</span>
                </label>
              </div>
            </div>
          </div>

          {/* 블록 에디터 */}
          <div className="mt-4">
            <BlockEditor
              boardCode="NOTICE"
              postId={postId!}
              value={blocks}
              onChange={setBlocks}
              disabled={saving}
            />
          </div>

          {/* 하단 버튼 */}
          <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-end gap-2">
            <button
              onClick={() => navigate("/recruit/notice")}
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
