import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { RecruitPost, PageResponse } from "../api/recruitApi";
import { getNewsPosts, updateNewsPin } from "../api/newsApi";
import RecruitFab from "../components/RecruitFab";

function isAdminRole(role?: string | null) {
  return role === "ROLE_SUPER_ADMIN" || role === "ROLE_PRESIDENT";
}

export default function NewsListPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const canEdit = isAdminRole(user?.role);

  const [pageData, setPageData] = useState<PageResponse<RecruitPost> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(15);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"latest" | "views">("latest");

  const fetchPage = async (nextPage: number) => {
    setLoading(true);
    try {
      const data = await getNewsPosts(nextPage, size);
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
    const searched = q ? posts.filter((p) => p.title.toLowerCase().includes(q)) : posts;

    return [...searched].sort((a, b) => {
      // pinned 상단
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      if (sort === "views") return b.viewCount - a.viewCount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [posts, query, sort]);

  const pageLoading = loading || authLoading;
  const totalPages = pageData?.totalPages ?? 1;

  const togglePin = async (post: RecruitPost) => {
    try {
      await updateNewsPin(post.id, !post.pinned);
      await fetchPage(page);
    } catch {
      alert("고정 설정 실패(권한/로그인 확인)");
    }
  };

  const calcDisplayNo = (indexInList: number) => {
    const total = pageData?.totalElements ?? 0;
    return total - (page * size + indexInList);
  };

  return (
    <div className="pt-24 md:pt-28 max-w-5xl mx-auto px-4 sm:px-6 pb-24 font-paperlogy">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-xs font-black text-[#813eb6]">
              ADPIA
            </span>
          </div>
          <h1 className="mt-2 text-2xl md:text-3xl font-black text-gray-900">보도자료</h1>
          <p className="mt-1 text-sm font-bold text-gray-500">언론/보도 내용을 정리합니다.</p>
        </div>

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

      {/* 검색/정렬 */}
      <div className="mt-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="relative w-full md:w-[420px]">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="제목 검색"
            className="w-full pl-4 pr-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-200"
          />
        </div>

        <div className="flex items-center gap-2">
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
        </div>
      </div>

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
          <div className="p-6 text-sm font-bold text-gray-400">보도자료가 없습니다.</div>
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
                onClick={() => navigate(`/about/news/${p.id}`)}
              >
                <div className="col-span-2 text-sm font-black text-gray-700">{calcDisplayNo(index)}</div>

                <div className="col-span-7 flex items-center gap-2 min-w-0">
                  {p.pinned && (
                    <span className="text-[11px] font-black px-2 py-1 rounded-lg bg-purple-50 border border-purple-200 text-[#813eb6]">
                      고정
                    </span>
                  )}
                  <div className="truncate text-sm font-bold text-gray-900">{p.title}</div>

                  {canEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePin(p);
                      }}
                      className="ml-auto px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-[11px] font-black text-gray-700 hover:text-[#813eb6]"
                    >
                      {p.pinned ? "고정해제" : "고정"}
                    </button>
                  )}
                </div>

                <div className="col-span-1 text-center text-sm font-black text-gray-700">{p.viewCount}</div>
                <div className="col-span-2 text-right text-sm font-black text-gray-500">
                  {new Date(p.createdAt).toISOString().slice(0, 10)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* pagination */}
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

      {canEdit && <RecruitFab label="보도자료 작성" onClick={() => navigate("/about/news/new")} />}
    </div>
  );
}