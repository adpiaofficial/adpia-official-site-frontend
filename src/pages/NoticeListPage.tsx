import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import RecruitPostCard from "../components/RecruitPostCard";
import RecruitFab from "../components/RecruitFab";
import { useAuth } from "../contexts/AuthContext";
import { getRecruitPosts, type RecruitPost, type PageResponse, updateRecruitPostPin } from "../api/recruitApi";

function canWriteNotice(role?: string | null) {
  return role === "ROLE_SUPER_ADMIN" || role === "ROLE_PRESIDENT";
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

export default function NoticeListPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [pageData, setPageData] = useState<PageResponse<RecruitPost> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(15);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"latest" | "views">("latest");

  const showWriteFab = canWriteNotice(user?.role);
  const canPin = showWriteFab;

  const fetchPage = async (nextPage: number) => {
    setLoading(true);
    try {
      const data = await getRecruitPosts("NOTICE", nextPage, size);
      setPageData(data);
      setPage(nextPage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size]);

  const posts = pageData?.content ?? [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q ? posts.filter((p) => p.title.toLowerCase().includes(q)) : posts;

    return [...base].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      if (sort === "views") return b.viewCount - a.viewCount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [posts, query, sort]);

  const pinned = filtered.filter((p) => p.pinned);
  const normal = filtered.filter((p) => !p.pinned);

  const pageLoading = loading || authLoading;
  const totalPages = pageData?.totalPages ?? 1;

  const togglePin = async (post: RecruitPost) => {
    try {
      await updateRecruitPostPin(post.id, !post.pinned);
      await fetchPage(page); // ✅ 다시 불러오기
    } catch {
      alert("고정 설정 실패(권한/로그인 확인)");
    }
  };

  return (
    <div className="pt-24 md:pt-28 max-w-6xl mx-auto px-4 sm:px-6 pb-24">
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-xs font-black text-[#813eb6]">
            Recruit
          </span>
          <span className="text-xs font-black text-gray-400"></span>
        </div>

        <h1 className="text-2xl md:text-3xl font-black text-gray-900">공지사항</h1>
      </div>

      <div className="mt-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="relative w-full md:w-[420px]">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="공지 제목 검색"
            className="w-full pl-4 pr-12 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-200"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm font-black">
            
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSort("latest")}
            className={[
              "px-4 py-3 rounded-2xl border text-sm font-black transition-all",
              sort === "latest"
                ? "border-purple-200 text-[#813eb6] bg-purple-50"
                : "border-gray-200 text-gray-600 bg-white hover:text-[#813eb6] hover:border-purple-200",
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
                : "border-gray-200 text-gray-600 bg-white hover:text-[#813eb6] hover:border-purple-200",
            ].join(" ")}
          >
            조회순
          </button>

          <select
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-black text-gray-700"
            title="페이지당 개수"
          >
            <option value={15}>15개</option>
            <option value={30}>30개</option>
          </select>
        </div>
      </div>

      {/* Featured */}
      <div className="mt-7">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-gray-800 flex items-center gap-2">
            <span className="text-[#813eb6]">●</span> Featured
          </h2>
          <span className="text-xs font-bold text-gray-400">{pinned.length} pinned</span>
        </div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {pageLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 rounded-2xl border border-gray-100 bg-white shadow-sm animate-pulse" />
            ))
          ) : pinned.length === 0 ? (
            <div className="text-sm font-bold text-gray-400 bg-white border border-gray-100 rounded-2xl p-5">
              고정 공지가 없습니다.
            </div>
          ) : (
            pinned.map((p) => (
              <div key={p.id} className="relative">
                <RecruitPostCard
                  post={p}
                  variant="featured"
                  metaRight={formatDate(p.createdAt)}
                  onClick={() => navigate(`/recruit/notice/${p.id}`)}
                />

                {canPin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePin(p);
                    }}
                    className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-white/90 border border-gray-200 text-[11px] font-black text-gray-700 hover:text-[#813eb6]"
                  >
                    {p.pinned ? "고정해제" : "고정"}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* All */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-gray-800">All Posts</h2>
          <span className="text-xs font-bold text-gray-400">
            {pageData ? `page ${page + 1} / ${totalPages}` : ""}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {pageLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-36 rounded-2xl border border-gray-100 bg-white shadow-sm animate-pulse" />
            ))
          ) : normal.length === 0 ? (
            <div className="text-sm font-bold text-gray-400 bg-white border border-gray-100 rounded-2xl p-5">
              공지가 없습니다.
            </div>
          ) : (
            normal.map((p) => (
              <div key={p.id} className="relative">
                <RecruitPostCard
                  post={p}
                  metaRight={`${p.viewCount.toLocaleString()} views`}
                  onClick={() => navigate(`/recruit/notice/${p.id}`)}
                />

                {canPin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePin(p);
                    }}
                    className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-[11px] font-black text-gray-700 hover:text-[#813eb6]"
                  >
                    {p.pinned ? "고정해제" : "고정"}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* pagination */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <button disabled={pageLoading || page <= 0} onClick={() => fetchPage(0)}
          className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-black text-gray-600 disabled:opacity-40">
          처음
        </button>
        <button disabled={pageLoading || page <= 0} onClick={() => fetchPage(page - 1)}
          className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-black text-gray-600 disabled:opacity-40">
          이전
        </button>

        <span className="px-4 py-2 text-sm font-black text-gray-700">
          {page + 1} / {totalPages}
        </span>

        <button disabled={pageLoading || page >= totalPages - 1} onClick={() => fetchPage(page + 1)}
          className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-black text-gray-600 disabled:opacity-40">
          다음
        </button>
        <button disabled={pageLoading || page >= totalPages - 1} onClick={() => fetchPage(totalPages - 1)}
          className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-black text-gray-600 disabled:opacity-40">
          마지막
        </button>
      </div>

      {showWriteFab && (
        <RecruitFab
          label="공지 작성"
          onClick={() => navigate("/recruit/notice/new")}
        />
      )}
    </div>
  );
}
