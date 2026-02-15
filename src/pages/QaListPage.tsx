// src/pages/QaListPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getRecruitPosts, type RecruitPost, type PageResponse, updateRecruitPostPin } from "../api/recruitApi";
import RecruitFab from "../components/RecruitFab";

function isAdminRole(role?: string | null) {
  return role === "ROLE_SUPER_ADMIN" || role === "ROLE_PRESIDENT";
}

type Tab = "ALL" | "FAQ"; // ✅ FAQ 탭 = 자주하는질문

export default function QaListPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [pageData, setPageData] = useState<PageResponse<RecruitPost> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  // ✅ 12번: 15 / 30
  const [size, setSize] = useState(15);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"latest" | "views">("latest");
  const [tab, setTab] = useState<Tab>("ALL"); // ✅ ALL / 자주하는질문

  const showWriteFab = true; // ✅ QA는 누구나 작성 진입
  const canPin = isAdminRole(user?.role);

  const fetchPage = async (nextPage: number) => {
    setLoading(true);
    try {
      const data = await getRecruitPosts("QA", nextPage, size);
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

    // 1) 탭 필터
    const tabBase = tab === "FAQ" ? posts.filter((p) => p.pinned) : posts;

    // 2) 검색 필터
    const searched = q ? tabBase.filter((p) => p.title.toLowerCase().includes(q)) : tabBase;

    // 3) 정렬
    return [...searched].sort((a, b) => {
      // ✅ ALL 탭에서는 pinned를 무조건 상단으로
      if (tab === "ALL" && a.pinned !== b.pinned) return a.pinned ? -1 : 1;

      // ✅ FAQ 탭: "자주하는질문으로 채택된 경우에만 작성순"
      // (= pinned만 남아있으니) 생성일 오름차순(작성된 순서대로)로 고정
      if (tab === "FAQ") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      // ✅ ALL 탭: 기존 정렬 옵션 유지
      if (sort === "views") return b.viewCount - a.viewCount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [posts, query, sort, tab]);

  const pageLoading = loading || authLoading;
  const totalPages = pageData?.totalPages ?? 1;

  const togglePin = async (post: RecruitPost) => {
    try {
      await updateRecruitPostPin(post.id, !post.pinned);
      await fetchPage(page);
    } catch {
      alert("자주하는질문(고정) 설정 실패(권한/로그인 확인)");
    }
  };

  // ✅ 글번호: 전체 글 수 기준(최신글이 가장 큰 번호로 표시)
  // 예: totalElements=100이면, 첫 줄은 100, 그 아래는 99...
  const calcDisplayNo = (indexInList: number) => {
    const total = pageData?.totalElements ?? 0;
    return total - (page * size + indexInList);
  };

  return (
    <div className="pt-24 md:pt-28 max-w-5xl mx-auto px-4 sm:px-6 pb-24">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-xs font-black text-[#813eb6]">
              Recruit
            </span>
          </div>
          <h1 className="mt-2 text-2xl md:text-3xl font-black text-gray-900">Q&amp;A</h1>
          <p className="mt-1 text-sm font-bold text-gray-500"></p>
        </div>

        <div className="flex items-center gap-2">
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

      {/* ✅ 탭 + 검색/정렬 */}
      <div className="mt-5 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab("ALL")}
              className={[
                "px-4 py-3 rounded-2xl border text-sm font-black transition-all",
                tab === "ALL"
                  ? "border-purple-200 text-[#813eb6] bg-purple-50"
                  : "border-gray-200 text-gray-600 bg-white hover:text-[#813eb6] hover:border-purple-200",
              ].join(" ")}
            >
              전체
            </button>
            <button
              onClick={() => setTab("FAQ")}
              className={[
                "px-4 py-3 rounded-2xl border text-sm font-black transition-all",
                tab === "FAQ"
                  ? "border-purple-200 text-[#813eb6] bg-purple-50"
                  : "border-gray-200 text-gray-600 bg-white hover:text-[#813eb6] hover:border-purple-200",
              ].join(" ")}
            >
              자주하는질문
            </button>
          </div>

          {/* ✅ FAQ 탭일 땐 정렬 버튼 숨김(작성순 고정) */}
          {tab !== "FAQ" && (
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
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="relative w-full md:w-[420px]">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tab === "FAQ" ? "자주하는질문 검색" : "제목 검색"}
              className="w-full pl-4 pr-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-200"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <div className="text-sm font-black text-gray-900">{tab === "FAQ" ? "자주하는질문" : "목록"}</div>
          <div className="text-xs font-bold text-gray-400">{pageData ? `page ${page + 1} / ${totalPages}` : ""}</div>
        </div>

        {pageLoading ? (
          <div className="p-6 text-sm font-bold text-gray-400">불러오는 중...</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-sm font-bold text-gray-400">{tab === "FAQ" ? "자주하는질문이 없습니다." : "질문이 없습니다."}</div>
        ) : (
          <div className="divide-y divide-gray-50">
            <div className="grid grid-cols-12 px-5 py-3 text-xs font-black text-gray-400 bg-gray-50">
              <div className="col-span-3 md:col-span-2">번호</div>
              <div className="col-span-9 md:col-span-10">제목</div>
            </div>

            {filtered.map((p, index) => (
              <div
                key={p.id}
                className="grid grid-cols-12 px-5 py-4 hover:bg-purple-50/40 cursor-pointer"
                onClick={() => navigate(`/recruit/qa/${p.id}`)}
              >
                {/* ✅ 글번호: 누적 큰 번호(최신글이 가장 큰 번호) */}
                <div className="col-span-3 md:col-span-2 text-sm font-black text-gray-700">{calcDisplayNo(index)}</div>

                <div className="col-span-9 md:col-span-10 flex items-center gap-2 min-w-0">
                  {p.pinned && (
                    <span className="text-[11px] font-black px-2 py-1 rounded-lg bg-purple-50 border border-purple-200 text-[#813eb6]">
                      자주하는질문
                    </span>
                  )}
                  {p.secret && <span className="text-[11px] font-black px-2 py-1 rounded-lg bg-gray-900 text-white">🔒</span>}

                  <div className="truncate text-sm font-bold text-gray-900">{p.title}</div>

                  {canPin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePin(p);
                      }}
                      className="ml-auto px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-[11px] font-black text-gray-700 hover:text-[#813eb6]"
                    >
                      {p.pinned ? "고정해제" : "자주하는질문 고정"}
                    </button>
                  )}
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

      {showWriteFab && <RecruitFab label="질문하기" onClick={() => navigate("/recruit/qa/new")} />}
    </div>
  );
}
