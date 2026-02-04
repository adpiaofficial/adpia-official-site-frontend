import type { RecruitPost } from "../api/recruitApi";

type Props = {
  post: RecruitPost;
  onClick?: () => void;
  metaRight?: string;
  variant?: "default" | "featured";
};

function displayAuthor(post: RecruitPost) {
  // ✅ 백엔드에서 내려주는 표시용 이름(34기 기획부 김상화)을 최우선 사용
  const name = (post.authorName ?? "").trim();
  if (name) return name;

  // fallback (혹시 authorName이 비어있을 때만)
  return post.authorType === "MEMBER" ? "Member" : "Guest";
}

export default function RecruitPostCard({
  post,
  onClick,
  metaRight,
  variant = "default",
}: Props) {
  const border =
    variant === "featured"
      ? "border-purple-200/70 hover:border-purple-300"
      : "border-gray-100 hover:border-purple-200";

  const glow =
    variant === "featured"
      ? "shadow-[0_8px_30px_rgba(129,62,182,0.12)]"
      : "shadow-sm";

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group text-left w-full rounded-2xl border bg-white p-5 transition-all",
        "hover:-translate-y-[1px] active:translate-y-0",
        border,
        glow,
      ].join(" ")}
    >
      {/* 상단 배지 라인 */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {post.pinned && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 border border-purple-100 text-xs font-black text-[#813eb6]">
              📌 pinned
            </span>
          )}
          {post.secret && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100 text-xs font-black text-gray-700">
              🔒 secret
            </span>
          )}
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100 text-xs font-black text-gray-600">
            {post.boardCode}
          </span>
        </div>

        {metaRight && (
          <span className="shrink-0 text-xs font-black text-gray-400">
            {metaRight}
          </span>
        )}
      </div>

      {/* 제목 */}
      <div className="mt-3 text-base font-black text-gray-900 break-keep line-clamp-2 group-hover:text-[#813eb6] transition-colors">
        {post.title}
      </div>

      {/* 하단 메타 */}
      <div className="mt-4 flex items-center justify-between text-xs font-bold text-gray-500">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1">
            <span className="text-gray-300">●</span>
            {displayAuthor(post)}
          </span>
          <span className="text-gray-300">|</span>
          <span className="inline-flex items-center gap-1">
            👁 {post.viewCount.toLocaleString()}
          </span>
        </div>

        <span className="text-gray-300 group-hover:text-purple-300 transition-colors">
          →
        </span>
      </div>
    </button>
  );
}
