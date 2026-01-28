import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { deleteRecruitPost, getRecruitPost, type RecruitPost } from "../api/recruitApi";
import { useAuth } from "../contexts/AuthContext";
import RecruitBlockRenderer from "../components/RecruitBlockRenderer";
import RecruitComments from "../components/RecruitComments";

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

/**
 * ✅ 비밀번호 입력 제한: 영문/숫자/특수문자만 허용
 * - 한글/이모지/공백 등 제거
 * - 특수문자 허용 범위는 필요하면 조정 가능
 */
function sanitizePw(v: string) {
  return v.replace(/[^A-Za-z0-9!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|`~]/g, "");
}

/**
 * ✅ 수정/삭제 버튼 노출 정책
 * - 관리자: 항상 가능
 * - 회원 작성글: 본인만
 * - 게스트 작성글:
 *    - 비밀글 + locked 상태면 버튼 숨김 (비번 unlock 후에만 보이게)
 *    - locked 풀리면 수정/삭제 가능
 */
function canEditQA(user: any, post: RecruitPost) {
  if (!post) return false;

  // 잠긴 비밀글이면: 관리자/본인만 true, 게스트는 unlock 전 false
  if (post.secret && post.locked) {
    if (isAdminRole(user?.role)) return true;
    if (user && post.authorType === "MEMBER" && post.authorMemberId === user.id) return true;
    return false; // ✅ 게스트는 unlock 해야 버튼 보임
  }

  if (isAdminRole(user?.role)) return true;
  if (user && post.authorType === "MEMBER" && post.authorMemberId === user.id) return true;

  // 잠금이 풀린 게스트 글이면 수정/삭제 가능
  if (post.authorType === "GUEST") return true;

  return false;
}

export default function QaDetailPage() {
  const { id } = useParams();
  const postId = Number(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState<RecruitPost | null>(null);
  const [loading, setLoading] = useState(true);

  // unlock input
  const [password, setPassword] = useState("");
  const [unlocking, setUnlocking] = useState(false);

  // delete modal for guest
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePw, setDeletePw] = useState("");

  const canEdit = useMemo(() => (post ? canEditQA(user, post) : false), [user, post]);

  const fetchPost = async (pw?: string) => {
    console.log("FETCH POST", { postId, pw });
    setLoading(true);
    try {
      const data = await getRecruitPost(postId, pw);
      setPost(data);
    } catch (e: any) {
      alert(e?.response?.data?.message || "Q&A 조회 실패");
      navigate("/recruit/qa", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (Number.isFinite(postId)) fetchPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const onUnlock = async () => {
    const pw = password.trim();
    if (!pw) return alert("비밀번호를 입력해주세요.");
    try {
      setUnlocking(true);
      await fetchPost(pw);
    } finally {
      setUnlocking(false);
    }
  };

  // ✅ 삭제 버튼 클릭: 게스트면 prompt 대신 모달로 비번 받기(한글 입력 차단 가능)
  const onDelete = async () => {
    if (!post) return;

    if (post.authorType === "GUEST") {
      setDeletePw("");
      setDeleteOpen(true);
      return;
    }

    if (!confirm("삭제할까요?")) return;

    try {
      await deleteRecruitPost(post.id);
      alert("삭제되었습니다.");
      navigate("/recruit/qa", { replace: true });
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401) navigate("/login");
      else alert(e?.response?.data?.message || "삭제 실패");
    }
  };

  const confirmDeleteGuest = async () => {
    if (!post) return;
    const pw = deletePw.trim();
    if (!pw) return alert("비밀번호를 입력해주세요.");
    if (!confirm("삭제할까요?")) return;

    try {
      await deleteRecruitPost(post.id, pw);
      alert("삭제되었습니다.");
      navigate("/recruit/qa", { replace: true });
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401) navigate("/login");
      else alert(e?.response?.data?.message || "삭제 실패");
    } finally {
      setDeleteOpen(false);
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

  const locked = !!post.locked;

  return (
    <div className="pt-24 md:pt-28 max-w-4xl mx-auto px-4 sm:px-6 pb-24">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => navigate("/recruit/qa", { replace: true })}
          className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-black text-gray-700 hover:text-[#813eb6] hover:border-purple-200 transition-all"
        >
          ← 목록
        </button>

        <div className="flex items-center gap-2">
          {canEdit && (
            <>
              <button
                onClick={() => {
                  // ✅ 게스트 비밀글이면 unlock 비번으로 edit에 password 쿼리 넘겨주기
                  // (잠금 상태에서 버튼이 안 보이긴 하지만 안전장치)
                  if (post.authorType === "GUEST" && post.secret && locked) {
                    alert("비밀번호를 먼저 입력해주세요.");
                    return;
                  }
                  const qp =
                    post.authorType === "GUEST" ? `?password=${encodeURIComponent(password.trim())}` : "";
                  navigate(`/recruit/qa/${post.id}/edit${qp}`);
                }}
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

      <div className="mt-4 rounded-[2.5rem] border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 bg-gradient-to-br from-purple-50 via-white to-white">
          <div className="flex items-center gap-2">
            {post.pinned && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs font-black text-[#813eb6]">
                ⭐ FAQ
              </span>
            )}
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-50 border border-gray-100 text-xs font-black text-gray-600">
              Q&amp;A
            </span>
            {post.secret && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-900 text-xs font-black text-white">
                🔒 비밀글
              </span>
            )}
          </div>

          <h1 className="mt-3 text-2xl md:text-3xl font-black text-gray-900 leading-tight break-keep">
            {post.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-gray-500">
            <span>작성자: {post.authorName ?? (post.authorType === "MEMBER" ? "MEMBER" : "GUEST")}</span>
            <span>작성일: {formatDateTime(post.createdAt)}</span>
            <span>조회수: {post.viewCount.toLocaleString()}</span>
            {post.updatedAt && post.updatedAt !== post.createdAt && (
              <span>수정: {formatDateTime(post.updatedAt)}</span>
            )}
          </div>
        </div>

        <div className="p-6 md:p-8 border-t border-gray-100">
          {post.secret && locked ? (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <div className="text-sm font-black text-gray-800">비밀글입니다.</div>
              <div className="mt-2 text-xs font-bold text-gray-500">
                비밀번호를 입력하면 내용을 확인할 수 있습니다.
              </div>

              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <input
                  value={password}
                  onChange={(e) => setPassword(sanitizePw(e.target.value))}
                  type="password"
                  placeholder="비밀번호 (영문/숫자/특수문자)"
                  className="w-full sm:w-64 px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-700"
                />
                <button
                  type="button"
                  onClick={() => {
                    console.log("UNLOCK CLICKED", password);
                    onUnlock();
                  }}
                  disabled={unlocking}
                  className="px-4 py-3 rounded-2xl bg-[#813eb6] text-white text-sm font-black disabled:opacity-60"
                >
                  {unlocking ? "확인 중..." : "열람하기"}
                </button>
              </div>

              <div className="mt-2 text-xs font-bold text-gray-400">
                * 한글/공백은 자동으로 제거됩니다.
              </div>
            </div>
          ) : post.blocks?.length ? (
            <RecruitBlockRenderer blocks={post.blocks} />
          ) : (
            <div className="text-sm font-bold text-gray-400">본문이 없습니다.</div>
          )}

          {/* ✅ 댓글/대댓글: 잠금 해제된 경우에만 */}
          {!locked && <RecruitComments postId={post.id} />}
        </div>
      </div>

      {/* ✅ 게스트 삭제 비밀번호 모달 (prompt 제거) */}
      {deleteOpen && post?.authorType === "GUEST" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
            <div className="text-lg font-black text-gray-900">비밀번호 확인</div>
            <p className="mt-2 text-sm font-bold text-gray-500">
              게스트 글 삭제를 위해 비밀번호가 필요합니다.
            </p>

            <div className="mt-4">
              <input
                value={deletePw}
                onChange={(e) => setDeletePw(sanitizePw(e.target.value))}
                type="password"
                placeholder="비밀번호 (영문/숫자/특수문자)"
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-800"
              />
              <div className="mt-2 text-xs font-bold text-gray-400">
                * 한글/공백은 자동으로 제거됩니다.
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
                className="px-4 py-2 rounded-2xl border border-gray-200 bg-white text-sm font-black text-gray-700"
              >
                취소
              </button>
              <button
                type="button"
                onClick={confirmDeleteGuest}
                className="px-4 py-2 rounded-2xl bg-red-600 text-white text-sm font-black"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
