import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { deleteRecruitPost, getRecruitPost, type RecruitPost } from "../api/recruitApi";
import { useAuth } from "../contexts/AuthContext";
import RecruitBlockRenderer from "../components/RecruitBlockRenderer";

function formatDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd} ${hh}:${mi}`;
}

function canEditNotice(user: any, post: RecruitPost) {
  if (!user) return false;
  if (user.role === "ROLE_SUPER_ADMIN") return true;
  // NOTICE: 본인 글만
  return post.authorType === "MEMBER" && post.authorMemberId === user.id;
}

export default function NoticeDetailPage() {
  const { id } = useParams();
  const postId = Number(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState<RecruitPost | null>(null);
  const [loading, setLoading] = useState(true);

  const canEdit = useMemo(() => (post ? canEditNotice(user, post) : false), [user, post]);

  const lastFetchedIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!Number.isFinite(postId)) return;

    if (lastFetchedIdRef.current === postId) return;
    lastFetchedIdRef.current = postId;

    const run = async () => {
      setLoading(true);
      try {
        const data = await getRecruitPost(postId);
        setPost(data);
      } catch (e: any) {
        lastFetchedIdRef.current = null;

        alert(e?.response?.data?.message || "공지 조회 실패");
        navigate("/recruit/notice", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [postId, navigate]);

  const onDelete = async () => {
    if (!post) return;
    const ok = confirm("삭제할까요?");
    if (!ok) return;

    try {
      await deleteRecruitPost(post.id);
      alert("삭제되었습니다.");
      navigate("/recruit/notice", { replace: true });
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401) navigate("/login");
      else alert(e?.response?.data?.message || "삭제 실패");
    }
  };

  if (loading) {
    return (
      <div className="pt-24 md:pt-28 max-w-4xl mx-auto px-4 sm:px-6 pb-24">
        <div className="h-40 rounded-3xl border border-gray-100 bg-white shadow-sm animate-pulse" />
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="pt-24 md:pt-28 max-w-4xl mx-auto px-4 sm:px-6 pb-24">
      {/* top actions */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => navigate("/recruit/notice", { replace: true })}
          className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-black text-gray-700 hover:text-[#813eb6] hover:border-purple-200 transition-all"
        >
          ← 목록
        </button>

        <div className="flex items-center gap-2">
          {canEdit && (
            <>
              <button
                onClick={() => navigate(`/recruit/notice/${post.id}/edit`)}
                className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-black text-gray-700 hover:text-[#813eb6] hover:border-purple-200 transition-all"
              >
                수정
              </button>
              <button
                onClick={onDelete}
                className="px-4 py-2 rounded-xl border border-red-200 bg-red-50 text-sm font-black text-red-600 hover:bg-red-100 transition-all"
              >
                삭제
              </button>
            </>
          )}
        </div>
      </div>

      {/* header card */}
      <div className="mt-4 rounded-[2.5rem] border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 bg-gradient-to-br from-purple-50 via-white to-white">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {post.pinned && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs font-black text-[#813eb6]">
                    📌 pinned
                  </span>
                )}
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-50 border border-gray-100 text-xs font-black text-gray-600">
                  NOTICE
                </span>
              </div>

              <h1 className="mt-3 text-2xl md:text-3xl font-black text-gray-900 leading-tight break-keep">
                {post.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-gray-500">
                <span>작성자: {post.authorName ?? "ADPIA"}</span>
                <span>작성일: {formatDateTime(post.createdAt)}</span>
                <span>조회수: {post.viewCount.toLocaleString()}</span>
                {post.updatedAt && post.updatedAt !== post.createdAt && (
                  <span>수정: {formatDateTime(post.updatedAt)}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* body */}
        <div className="p-6 md:p-8 border-t border-gray-100">
          {post.blocks?.length ? (
            <RecruitBlockRenderer blocks={post.blocks} />
          ) : (
            <div className="text-sm font-bold text-gray-400">본문이 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
}
