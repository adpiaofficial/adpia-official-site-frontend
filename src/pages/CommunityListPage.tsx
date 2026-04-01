import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { RecruitPost, PageResponse } from "../api/recruitApi";
import { getCommunityPosts, updateCommunityPin } from "../api/communityApi";
import RecruitFab from "../components/RecruitFab";
import useRequireLoginRedirect from "../hooks/useRequireLoginRedirect";
import { communityCategoryMeta, isCommunityCategory } from "../lib/communityCategory";

function isAdminRole(role?: string | null) {
  return role === "ROLE_SUPER_ADMIN" || role === "ROLE_PRESIDENT";
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString().slice(0, 10);
}

function PhotoCard({
  post,
  isAdmin,
  onTogglePin,
  onClick,
  pinLabel,
}: {
  post: RecruitPost;
  isAdmin: boolean;
  onTogglePin: (post: RecruitPost) => void;
  onClick: () => void;
  pinLabel: string;
}) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all"
    >
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        {post.thumbnailUrl ? (
          <img
            src={post.thumbnailUrl}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm font-bold text-gray-400">
            이미지 없음
          </div>
        )}

        <div className="absolute top-3 left-3 flex items-center gap-2">
          {post.pinned && (
            <span className="text-[11px] font-black px-2 py-1 rounded-lg bg-white/90 border border-purple-200 text-[#813eb6] backdrop-blur">
              대표
            </span>
          )}
        </div>

        {isAdmin && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(post);
            }}
            className={[
              "absolute top-3 right-3 px-3 py-1.5 rounded-xl backdrop-blur border text-[11px] font-black transition-all",
              post.pinned
                ? "bg-[#813eb6]/90 border-[#813eb6] text-white"
                : "bg-white/90 border-gray-200 text-gray-700 hover:text-[#813eb6]",
            ].join(" ")}
          >
            {pinLabel}
          </button>
        )}
      </div>

      <div className="p-4">
        <div className="text-base font-black text-gray-900 line-clamp-1">{post.title}</div>
        <div className="mt-2 flex items-center justify-between text-xs font-bold text-gray-500">
          <span>{post.authorName ?? "관리자"}</span>
          <span>{formatDate(post.createdAt)}</span>
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs font-bold text-gray-400">
          <span>조회 {post.viewCount}</span>
          <span>좋아요 {post.likeCount ?? 0}</span>
        </div>
      </div>
    </div>
  );
}

export default function CommunityListPage() {
  const navigate = useNavigate();
  const { category } = useParams();
  const { user, authLoading } = useRequireLoginRedirect();

  if (!isCommunityCategory(category)) return null;

  const meta = communityCategoryMeta[category];
  const isAdmin = isAdminRole(user?.role);
  const canWrite = meta.adminWriteOnly ? isAdmin : !!user;

  const [pageData, setPageData] = useState<PageResponse<RecruitPost> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(meta.viewType === "photo" ? 12 : 15);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"latest" | "views">("latest");

  const fetchPage = async (nextPage: number) => {
    setLoading(true);
    try {
      const data = await getCommunityPosts(category, nextPage, size);
      setPageData(data);
      setPage(nextPage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    fetchPage(0);
  }, [authLoading, user, category, size]);

  const posts = pageData?.content ?? [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const searched = q ? posts.filter((p) => p.title.toLowerCase().includes(q)) : posts;

    return [...searched].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      if (sort === "views") return b.viewCount - a.viewCount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [posts, query, sort]);

  const pageLoading = loading || authLoading;
  const totalPages = pageData?.totalPages ?? 1;

  const getPinButtonLabel = (post: RecruitPost) => {
    if (meta.viewType === "photo") {
      return post.pinned ? "현재 대표사진" : "대표사진 설정";
    }
    return post.pinned ? "고정해제" : "고정";
  };

  const togglePin = async (post: RecruitPost) => {
    try {
      await updateCommunityPin(category, post.id, !post.pinned);
      await fetchPage(page);

      if (meta.viewType === "photo") {
        alert(post.pinned ? "대표사진이 해제되었습니다." : "대표사진으로 설정되었습니다.");
      }
    } catch {
      alert(meta.viewType === "photo" ? "대표사진 설정 실패" : "고정 설정 실패");
    }
  };

  const calcDisplayNo = (indexInList: number) => {
    const total = pageData?.totalElements ?? 0;
    return total - (page * size + indexInList);
  };

  if (authLoading || !user) return null;

  return (
    <div className="pt-24 md:pt-28 max-w-6xl mx-auto px-4 sm:px-6 pb-24 font-paperlogy">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-xs font-black text-[#813eb6]">
            {meta.badge}
          </span>
          <h1 className="mt-2 text-2xl md:text-3xl font-black text-gray-900">{meta.title}</h1>
        </div>

        <select
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          className="px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-black text-gray-700"
        >
          {meta.viewType === "photo" ? (
            <>
              <option value={12}>12개</option>
              <option value={24}>24개</option>
            </>
          ) : (
            <>
              <option value={15}>15개</option>
              <option value={30}>30개</option>
            </>
          )}
        </select>
      </div>

      <div className="mt-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="제목 검색"
          className="w-full md:w-[420px] px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-700"
        />

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSort("latest")}
            className={[
              "px-4 py-3 rounded-2xl border text-sm font-black transition-all",
              sort === "latest"
                ? "border-purple-200 text-[#813eb6] bg-purple-50"
                : "border-gray-200 text-gray-600 bg-white",
            ].join(" ")}
          >
            최신순
          </button>
          <button
            onClick={() => setSort("views")}
            className={[
              "px-4 py-3 rounded-2xl border text-sm font-black transition-all",
              sort === "views"
                ? "border-purple-200 text-[#813eb6] bg-purple-50"
                : "border-gray-200 text-gray-600 bg-white",
            ].join(" ")}
          >
            조회순
          </button>
        </div>
      </div>

      {meta.viewType === "photo" ? (
        <div className="mt-6">
          {pageLoading ? (
            <div className="p-6 text-sm font-bold text-gray-400">불러오는 중...</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-sm font-bold text-gray-400">{meta.title} 글이 없습니다.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((p) => (
                <PhotoCard
                  key={p.id}
                  post={p}
                  isAdmin={isAdmin}
                  onTogglePin={togglePin}
                  onClick={() => navigate(`/community/${category}/${p.id}`)}
                  pinLabel={getPinButtonLabel(p)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6 bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <div className="text-sm font-black text-gray-900">목록</div>
            <div className="text-xs font-bold text-gray-400">
              {pageData ? `page ${page + 1} / ${totalPages}` : ""}
            </div>
          </div>

          {pageLoading ? (
            <div className="p-6 text-sm font-bold text-gray-400">불러오는 중...</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-sm font-bold text-gray-400">{meta.title} 글이 없습니다.</div>
          ) : (
            <div className="divide-y divide-gray-50">
              <div className="grid grid-cols-12 px-5 py-3 text-xs font-black text-gray-400 bg-gray-50">
                <div className="col-span-2">번호</div>
                <div className="col-span-7">제목</div>
                <div className="col-span-1 text-center">조회</div>
                <div className="col-span-2 text-right">등록일</div>
              </div>

              {filtered.map((p, index) => (
                <div
                  key={p.id}
                  className="grid grid-cols-12 px-5 py-4 hover:bg-purple-50/40 cursor-pointer"
                  onClick={() => navigate(`/community/${category}/${p.id}`)}
                >
                  <div className="col-span-2 text-sm font-black text-gray-700">{calcDisplayNo(index)}</div>

                  <div className="col-span-7 flex items-center gap-2 min-w-0">
                    {p.pinned && (
                      <span className="text-[11px] font-black px-2 py-1 rounded-lg bg-purple-50 border border-purple-200 text-[#813eb6]">
                        {meta.viewType === "photo" ? "대표" : "고정"}
                      </span>
                    )}
                    <div className="truncate text-sm font-bold text-gray-900">{p.title}</div>

                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePin(p);
                        }}
                        className={[
                          "ml-auto px-3 py-1.5 rounded-xl border text-[11px] font-black transition-all",
                          meta.viewType === "photo" && p.pinned
                            ? "bg-[#813eb6] border-[#813eb6] text-white"
                            : "bg-white border-gray-200 text-gray-700",
                        ].join(" ")}
                      >
                        {getPinButtonLabel(p)}
                      </button>
                    )}
                  </div>

                  <div className="col-span-1 text-center text-sm font-black text-gray-700">{p.viewCount}</div>
                  <div className="col-span-2 text-right text-sm font-black text-gray-500">
                    {formatDate(p.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <button
          disabled={pageLoading || page <= 0}
          onClick={() => fetchPage(0)}
          className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-black text-gray-600 disabled:opacity-40"
        >
          처음
        </button>
        <button
          disabled={pageLoading || page <= 0}
          onClick={() => fetchPage(page - 1)}
          className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-black text-gray-600 disabled:opacity-40"
        >
          이전
        </button>
        <span className="px-4 py-2 text-sm font-black text-gray-700">
          {page + 1} / {totalPages}
        </span>
        <button
          disabled={pageLoading || page >= totalPages - 1}
          onClick={() => fetchPage(page + 1)}
          className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-black text-gray-600 disabled:opacity-40"
        >
          다음
        </button>
        <button
          disabled={pageLoading || page >= totalPages - 1}
          onClick={() => fetchPage(totalPages - 1)}
          className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-black text-gray-600 disabled:opacity-40"
        >
          마지막
        </button>
      </div>

      {canWrite && (
        <RecruitFab
          label={`${meta.title} 작성`}
          onClick={() => navigate(`/community/${category}/new`)}
        />
      )}
    </div>
  );
}