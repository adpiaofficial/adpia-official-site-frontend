import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  createRecruitComment,
  deleteRecruitComment,
  getRecruitComments,
  type RecruitComment,
} from "../api/recruitApi";

function isAdminRole(role?: string | null) {
  return role === "ROLE_SUPER_ADMIN" || role === "ROLE_PRESIDENT";
}

function formatDT(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd} ${hh}:${mi}`;
}

type Props = { postId: number };

// ✅ A 방식: deleted 댓글은 숨기고, 자식 댓글은 "승격"해서 보여줌
function pruneDeleted(arr: RecruitComment[]): RecruitComment[] {
  const out: RecruitComment[] = [];

  for (const c of arr) {
    const nextChildren = c.children ? pruneDeleted(c.children) : [];

    if (c.deleted) {
      // 부모가 삭제되면 부모는 숨기고 자식만 위로 올린다
      out.push(...nextChildren);
    } else {
      out.push({ ...c, children: nextChildren });
    }
  }

  return out;
}

export default function RecruitComments({ postId }: Props) {
  const { user } = useAuth();

  const [items, setItems] = useState<RecruitComment[]>([]);
  const [loading, setLoading] = useState(true);

  // root 작성
  const [content, setContent] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPw, setGuestPw] = useState("");

  const isGuest = !user;

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await getRecruitComments(postId);
      setItems(data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const onCreateRoot = async () => {
    if (!content.trim()) return alert("내용을 입력해주세요.");

    if (isGuest) {
      if (!guestName.trim()) return alert("작성자 이름을 입력해주세요.");
      if (!guestPw.trim()) return alert("비밀번호를 입력해주세요.");
    }

    await createRecruitComment(postId, {
      content: content.trim(),
      authorName: isGuest ? guestName.trim() : undefined,
      password: isGuest ? guestPw.trim() : undefined,
    });

    setContent("");
    await refresh();
  };

  const canDelete = (c: RecruitComment) => {
    if (isAdminRole(user?.role)) return true;
    if (!user) return true; // 게스트는 비번으로 삭제 가능
    return c.authorType === "MEMBER" && c.authorMemberId === user.id;
  };

  // ✅ 렌더/카운트용: 삭제된 댓글은 숨기고, 자식은 승격
  const visibleItems = useMemo(() => pruneDeleted(items), [items]);

  const CommentNode = ({ c, depth }: { c: RecruitComment; depth: number }) => {
    const [replyOpen, setReplyOpen] = useState(false);
    const [reply, setReply] = useState("");

    const [rGuestName, setRGuestName] = useState(guestName);
    const [rGuestPw, setRGuestPw] = useState(guestPw);

    const onReply = async () => {
      if (!reply.trim()) return alert("내용을 입력해주세요.");
      if (isGuest) {
        if (!rGuestName.trim()) return alert("작성자 이름을 입력해주세요.");
        if (!rGuestPw.trim()) return alert("비밀번호를 입력해주세요.");
      }

      await createRecruitComment(postId, {
        parentId: c.id,
        content: reply.trim(),
        authorName: isGuest ? rGuestName.trim() : undefined,
        password: isGuest ? rGuestPw.trim() : undefined,
      });

      setReply("");
      setReplyOpen(false);
      await refresh();
    };

    const onDelete = async () => {
      if (!confirm("삭제할까요?")) return;

      let pw: string | undefined;
      if (c.authorType === "GUEST") {
        pw = prompt("비밀번호를 입력해주세요.") ?? "";
        if (!pw.trim()) return;
      }

      await deleteRecruitComment(c.id, pw?.trim());
      await refresh();
    };

    return (
      <div className="py-4" style={{ paddingLeft: depth * 16 }}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-sm font-black text-gray-900">
                {c.authorName ?? (c.authorType === "MEMBER" ? "MEMBER" : "GUEST")}
              </div>
              <div className="text-xs font-bold text-gray-400">{formatDT(c.createdAt)}</div>
            </div>

            {/* ✅ 삭제된 댓글은 visibleItems 단계에서 제거되므로 메시지 표시/분기 필요 없음 */}
            <div className="mt-2 text-sm font-bold text-gray-700 whitespace-pre-wrap">
              {c.content}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => setReplyOpen((v) => !v)}
                className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-[12px] font-black text-gray-700 hover:text-[#813eb6]"
              >
                {replyOpen ? "취소" : "답글"}
              </button>

              {canDelete(c) && (
                <button
                  onClick={onDelete}
                  className="px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 text-[12px] font-black text-red-600 hover:bg-red-100"
                >
                  삭제
                </button>
              )}
            </div>
          </div>
        </div>

        {replyOpen && (
          <div className="mt-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
            {isGuest && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-2">
                <input
                  value={rGuestName}
                  onChange={(e) => setRGuestName(e.target.value)}
                  placeholder="이름"
                  className="md:col-span-4 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700"
                />
                <input
                  value={rGuestPw}
                  onChange={(e) => setRGuestPw(e.target.value)}
                  placeholder="비밀번호"
                  type="password"
                  className="md:col-span-4 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700"
                />
              </div>
            )}

            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="답글 내용"
              className="w-full min-h-[80px] px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700"
            />
            <div className="mt-2 flex justify-end">
              <button
                onClick={onReply}
                className="px-4 py-2 rounded-xl bg-[#813eb6] text-white text-sm font-black hover:bg-[#3d1d56]"
              >
                답글 등록
              </button>
            </div>
          </div>
        )}

        {c.children?.length ? (
          <div className="mt-2 border-l border-gray-100">
            {c.children.map((ch) => (
              <CommentNode key={ch.id} c={ch} depth={depth + 1} />
            ))}
          </div>
        ) : null}
      </div>
    );
  };

  // ✅ count도 visibleItems 기준으로
  const count = useMemo(() => {
    const dfs = (arr: RecruitComment[]): number =>
      arr.reduce((acc, c) => acc + 1 + (c.children ? dfs(c.children) : 0), 0);
    return dfs(visibleItems);
  }, [visibleItems]);

  return (
    <div className="mt-6 bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
        <div className="text-sm font-black text-gray-900">댓글</div>
        <div className="text-xs font-bold text-gray-400">{count}개</div>
      </div>

      <div className="p-6">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          {isGuest && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-2">
              <input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="이름"
                className="md:col-span-4 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700"
              />
              <input
                value={guestPw}
                onChange={(e) => setGuestPw(e.target.value)}
                placeholder="비밀번호"
                type="password"
                className="md:col-span-4 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700"
              />
            </div>
          )}

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="댓글을 입력하세요"
            className="w-full min-h-[90px] px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700"
          />

          <div className="mt-2 flex justify-end">
            <button
              onClick={onCreateRoot}
              className="px-5 py-2.5 rounded-xl bg-[#813eb6] text-white text-sm font-black hover:bg-[#3d1d56]"
            >
              댓글 등록
            </button>
          </div>
        </div>

        <div className="mt-5 divide-y divide-gray-50">
          {loading ? (
            <div className="py-6 text-sm font-bold text-gray-400">불러오는 중...</div>
          ) : visibleItems.length === 0 ? (
            <div className="py-6 text-sm font-bold text-gray-400">댓글이 없습니다.</div>
          ) : (
            visibleItems.map((c) => <CommentNode key={c.id} c={c} depth={0} />)
          )}
        </div>
      </div>
    </div>
  );
}
