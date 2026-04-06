import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { RecruitBlockRequest } from "../api/recruitApi";
import BlockEditor from "../components/BlockEditor";
import {
  createSeminarDraft,
  getSeminarPost,
  publishSeminarPost,
  updateSeminarPost,
} from "../api/seminarApi";
import useRequireLoginRedirect from "../hooks/useRequireLoginRedirect";
import {
  isSeminarCategory,
  seminarCategoryMeta,
} from "../lib/seminarCategory";

function isAdminRole(role?: string | null) {
  return role === "ROLE_SUPER_ADMIN" || role === "ROLE_PRESIDENT";
}

export default function SeminarUpsertPage() {
  const navigate = useNavigate();
  const { category, id } = useParams();
  const { user, authLoading } = useRequireLoginRedirect();

  if (!isSeminarCategory(category)) return null;
  const meta = seminarCategoryMeta[category];

  const isEdit = useMemo(() => Boolean(id), [id]);
  const postId = Number(id);
  const canEdit = isAdminRole(user?.role);

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [creatingDraft, setCreatingDraft] = useState(false);

  const [editorPostId, setEditorPostId] = useState<number | null>(isEdit ? postId : null);

  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState<RecruitBlockRequest[]>([
    { type: "TEXT", sortOrder: 0, text: "" },
  ]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    if (!canEdit) {
      alert("권한이 없습니다.");
      navigate(`/seminar/${category}`, { replace: true });
    }
  }, [authLoading, user, canEdit, category, navigate]);

  useEffect(() => {
    if (!isEdit || !Number.isFinite(postId)) return;
    if (!canEdit) return;

    const fetchPost = async () => {
      setLoading(true);
      try {
        const data = await getSeminarPost(category, postId);
        setEditorPostId(data.id);
        setTitle(data.title ?? "");
        setBlocks(
          data.blocks?.length
            ? data.blocks.map((b, idx) => ({
                type: b.type,
                sortOrder: b.sortOrder ?? idx,
                text: b.text ?? undefined,
                url: b.url ?? undefined,
                meta: b.meta ?? undefined,
              }))
            : [{ type: "TEXT", sortOrder: 0, text: "" }]
        );
      } catch (e: any) {
        alert(e?.response?.data?.message || `${meta.title} 글 조회 실패`);
        navigate(`/seminar/${category}`, { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [isEdit, postId, canEdit, category, navigate]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    if (!canEdit) return;
    if (isEdit) return;
    if (editorPostId) return;

    const createDraft = async () => {
      setCreatingDraft(true);
      try {
        const draft = await createSeminarDraft(category, { title: "제목 없음" });
        setEditorPostId(draft.id);
      } catch (e: any) {
        alert(e?.response?.data?.message || "작성 시작에 실패했습니다.");
        navigate(`/seminar/${category}`, { replace: true });
      } finally {
        setCreatingDraft(false);
      }
    };

    createDraft();
  }, [authLoading, user, canEdit, isEdit, editorPostId, category, navigate]);

  const normalizeBlocks = (items: RecruitBlockRequest[]) =>
    items.map((b, index) => ({
      ...b,
      sortOrder: index,
      text: b.type === "TEXT" ? b.text ?? "" : b.text,
    }));

  const onSubmit = async () => {
    if (!title.trim()) return alert("제목을 입력해주세요.");

    const normalizedBlocks = normalizeBlocks(blocks);

    setSubmitting(true);
    try {
      if (isEdit) {
        const saved = await updateSeminarPost(category, postId, {
          title: title.trim(),
          blocks: normalizedBlocks,
        });
        alert("수정되었습니다.");
        navigate(`/seminar/${category}/${saved.id}`, { replace: true });
      } else {
        if (!editorPostId) {
          alert("작성 공간을 준비 중입니다.");
          return;
        }

        const saved = await publishSeminarPost(editorPostId, {
          title: title.trim(),
          blocks: normalizedBlocks,
        });
        alert("등록되었습니다.");
        navigate(`/seminar/${category}/${saved.id}`, { replace: true });
      }
    } catch (e: any) {
      alert(e?.response?.data?.message || "저장 실패");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading || !user) {
    return (
      <div className="pt-24 md:pt-28 max-w-4xl mx-auto px-4 sm:px-6 pb-24">
        <div className="h-40 rounded-3xl border border-gray-100 bg-white shadow-sm animate-pulse" />
      </div>
    );
  }

  if (!canEdit) return null;

  return (
    <div className="pt-24 md:pt-28 max-w-4xl mx-auto px-4 sm:px-6 pb-24 font-paperlogy">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => navigate(`/seminar/${category}`)}
          className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-black text-gray-700"
        >
          ← 목록
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-black text-gray-700"
          >
            취소
          </button>
          <button
            disabled={submitting || creatingDraft || !editorPostId}
            onClick={onSubmit}
            className="px-5 py-2 rounded-xl bg-[#813eb6] text-white text-sm font-black disabled:opacity-50"
          >
            {creatingDraft
              ? "작성 공간 준비 중..."
              : submitting
              ? "저장 중..."
              : isEdit
              ? "수정하기"
              : "등록하기"}
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-[2.5rem] border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 bg-gradient-to-br from-purple-50 via-white to-white">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-xs font-black text-[#813eb6]">
            {meta.badge}
          </div>
          <h1 className="mt-3 text-2xl md:text-3xl font-black text-gray-900">
            {isEdit ? `${meta.title} 수정` : `${meta.title} 작성`}
          </h1>
        </div>

        <div className="p-6 md:p-8 border-t border-gray-100 space-y-6">
          <div>
            <label className="block text-sm font-black text-gray-800 mb-2">제목</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-700"
            />
          </div>

          <div>
            <div className="block text-sm font-black text-gray-800 mb-2">본문</div>
            {editorPostId ? (
              <BlockEditor
                boardCode={meta.boardCode}
                postId={editorPostId}
                value={blocks}
                onChange={setBlocks}
                disabled={submitting || creatingDraft}
              />
            ) : (
              <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-6 text-sm font-bold text-gray-400">
                작성 공간을 준비하는 중입니다...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}