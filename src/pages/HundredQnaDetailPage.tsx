import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { RecruitPost } from "../api/recruitApi";
import { useAuth } from "../contexts/AuthContext";
import RecruitBlockRenderer from "../components/RecruitBlockRenderer";
import RecruitComments from "../components/RecruitComments";
import {
  deleteHundredQnaPost,
  getHundredQnaPost,
  likeHundredQnaPost,
  unlikeHundredQnaPost,
} from "../api/hundredQnaApi";

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

function isAdminRole(role?: string | null) {
  return role === "ROLE_SUPER_ADMIN" || role === "ROLE_PRESIDENT";
}

export default function HundredQnaDetailPage() {
  const { id } = useParams();
  const postId = Number(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState<RecruitPost | null>(null);
  const [loading, setLoading] = useState(true);

  const canEdit = useMemo(() => isAdminRole(user?.role), [user?.role]);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const data = await getHundredQnaPost(postId);
      setPost(data);
    } catch (e: any) {
      alert(e?.response?.data?.message || "백문백답 조회 실패");
      navigate("/archive/hundred-qna", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (Number.isFinite(postId)) fetchPost();
  }, [postId]);

  const onDelete = async () => {
    if (!post) return;
    if (!canEdit) return alert("권한이 없습니다.");
    if (!confirm("삭제할까요?")) return;

    try {
      await deleteHundredQnaPost(post.id);
      alert("삭제되었습니다.");
      navigate("/archive/hundred-qna", { replace: true });
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401) navigate("/login");
      else if (status === 403) alert("권한이 없습니다.");
      else alert(e?.response?.data?.message || "삭제 실패");
    }
  };

  const onLikeToggle = async () => {
    if (!post) return;

    if (!user) {
      alert("좋아요는 로그인 후 사용할 수 있습니다.");
      navigate("/login");
      return;
    }

    try {
      if (post.likedByMe) {
        await unlikeHundredQnaPost(post.id);
      } else {
        await likeHundredQnaPost(post.id);
      }
      await fetchPost();
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401) navigate("/login");
      else if (status === 403) alert("권한이 없습니다.");
      else if (status === 404) alert("좋아요 API 경로를 찾을 수 없습니다.");
      else alert(e?.response?.data?.message || "좋아요 처리 실패");
    }
  };

  const liked = !!post?.likedByMe;

  if (loading) {
    return (
      <div className="pt-24 md:pt-28 max-w-4xl mx-auto px-4 sm:px-6 pb-24">
        <div className="h-40 rounded-3xl border border-gray-100 bg-white shadow-sm animate-pulse" />
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="pt-24 md:pt-28 max-w-4xl mx-auto px-4 sm:px-6 pb-24 font-paperlogy">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => navigate("/archive/hundred-qna", { replace: true })}
          className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-black text-gray-700 hover:text-[#813eb6] hover:border-purple-200 transition-all"
        >
          ← 목록
        </button>

        {canEdit && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/archive/hundred-qna/${post.id}/edit`)}
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
          </div>
        )}
      </div>

      <div className="mt-4 rounded-[2.5rem] border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 bg-gradient-to-br from-purple-50 via-white to-white">
          <div className="flex items-center gap-2">
            {post.pinned && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs font-black text-[#813eb6]">
                ⭐ 고정
              </span>
            )}
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-50 border border-gray-100 text-xs font-black text-gray-600">
              백문백답
            </span>
          </div>

          <h1 className="mt-3 text-2xl md:text-3xl font-black text-gray-900 leading-tight break-keep">
            {post.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-gray-500">
            <span>작성자: {post.authorName ?? "관리자"}</span>
            <span>작성일: {formatDateTime(post.createdAt)}</span>
            <span>조회수: {post.viewCount.toLocaleString()}</span>
            {post.updatedAt && post.updatedAt !== post.createdAt && (
              <span>수정: {formatDateTime(post.updatedAt)}</span>
            )}
          </div>
        </div>

        <div className="p-6 md:p-8 border-t border-gray-100">
          {post.blocks?.length ? (
            <RecruitBlockRenderer blocks={post.blocks} />
          ) : (
            <div className="text-sm font-bold text-gray-400">본문이 없습니다.</div>
          )}
        </div>
      </div>

      {post.likeEnabled && (
        <div className="mt-4 rounded-2xl border border-gray-100 bg-white shadow-sm px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100 text-xs font-black text-gray-600">
              참여
            </span>
            <span>이 글이 좋았다면 반응을 남겨보세요.</span>
          </div>

          <button
            onClick={onLikeToggle}
            className={[
              "inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-sm font-black transition-all",
              liked
                ? "border-pink-200 bg-pink-50 text-pink-600 shadow-sm"
                : "border-gray-200 bg-white text-gray-700 hover:text-[#813eb6] hover:border-purple-200",
            ].join(" ")}
          >
            <span className="text-base">{liked ? "❤️" : "🤍"}</span>
            <span>{liked ? "좋아요 취소" : "좋아요"}</span>
            <span className="inline-flex items-center justify-center min-w-7 h-7 px-2 rounded-full bg-white/80 border border-current/10 text-xs font-black">
              {post.likeCount ?? 0}
            </span>
          </button>
        </div>
      )}

      {post.commentEnabled && <RecruitComments postId={post.id} />}
    </div>
  );
}