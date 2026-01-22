import { useEffect, useMemo, useState } from "react";
import type { AdminMemberRow } from "../api/adminMembersApi";
import { getAdminMembers, patchMemberActive, patchMemberGrade } from "../api/adminMembersApi";

const gradeOptions = ["활동기수", "OB", "회장단", "마스터"] as const;

function roleLabel(role: string) {
  if (role === "ROLE_SUPER_ADMIN") return "SUPER_ADMIN";
  if (role === "ROLE_PRESIDENT") return "PRESIDENT";
  return "USER";
}

type SortKey = "name" | "generation" | "department" | "grade" | "role" | "active";
type SortDir = "asc" | "desc";

export default function AdminMembersPage() {
  const [members, setMembers] = useState<AdminMemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingIds, setSavingIds] = useState<Set<number>>(new Set());

  // 검색
  const [search, setSearch] = useState("");

  // ✅ 운영 기본 정렬: active 먼저 + (그 다음) 기수 내림
  const [sortKey, setSortKey] = useState<SortKey>("generation");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [activeFirst, setActiveFirst] = useState(true);

  // ✅ 페이지네이션
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await getAdminMembers();
      setMembers(data);
    } catch (e: any) {
      alert(e?.response?.data?.message || "회원 목록 조회 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const markSaving = (id: number, on: boolean) => {
    setSavingIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  // 검색/정렬/페이지옵션 바뀌면 첫 페이지로
  useEffect(() => {
    setPage(1);
  }, [search, pageSize, sortKey, sortDir, activeFirst]);

  // ✅ 필터링
  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;

    return members.filter((m) => {
      const name = (m.name ?? "").toLowerCase();
      const email = (m.email ?? "").toLowerCase();
      const dept = (m.department ?? "").toLowerCase();
      const gen = String(m.generation ?? "");
      const grade = (m.grade ?? "").toLowerCase();
      const role = (m.role ?? "").toLowerCase();

      return (
        name.includes(q) ||
        email.includes(q) ||
        dept.includes(q) ||
        gen.includes(q) ||
        grade.includes(q) ||
        role.includes(q)
      );
    });
  }, [members, search]);

  // ✅ 정렬 (active 우선 + 그 다음 선택 정렬)
  const sortedMembers = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;

    const getValue = (m: AdminMemberRow) => {
      switch (sortKey) {
        case "name":
          return (m.name ?? "").toLowerCase();
        case "generation":
          return m.generation ?? 0;
        case "department":
          return (m.department ?? "").toLowerCase();
        case "grade":
          return (m.grade ?? "").toLowerCase();
        case "role":
          return (m.role ?? "").toLowerCase();
        case "active":
          return m.active ? 1 : 0;
        default:
          return "";
      }
    };

    const copy = [...filteredMembers];

    copy.sort((a, b) => {
      // ✅ 1순위: active 먼저 (ON을 위로)
      if (activeFirst) {
        const aAct = a.active ? 1 : 0;
        const bAct = b.active ? 1 : 0;
        if (aAct !== bAct) return bAct - aAct;
      }

      // ✅ 2순위: 선택한 정렬 기준
      const va = getValue(a);
      const vb = getValue(b);

      if (typeof va === "number" && typeof vb === "number") {
        return (va - vb) * dir;
      }
      return String(va).localeCompare(String(vb), "ko") * dir;
    });

    return copy;
  }, [filteredMembers, sortKey, sortDir, activeFirst]);

  // ✅ 페이지네이션 계산
  const total = sortedMembers.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const end = start + pageSize;
  const pageMembers = sortedMembers.slice(start, end);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [safePage, page]);

  const goPage = (p: number) => {
    const next = Math.min(Math.max(1, p), totalPages);
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onChangeGrade = async (id: number, grade: string) => {
    const prev = members;
    setMembers((cur) => cur.map((m) => (m.id === id ? { ...m, grade } : m)));

    markSaving(id, true);
    try {
      const updated = await patchMemberGrade(id, grade);
      setMembers((cur) => cur.map((m) => (m.id === id ? updated : m)));
    } catch (e: any) {
      setMembers(prev);
      alert(e?.response?.data?.message || "grade 변경 실패");
    } finally {
      markSaving(id, false);
    }
  };

  const onToggleActive = async (id: number, active: boolean) => {
    if (!active) {
      const ok = confirm("해당 회원을 비활성화(밴)하시겠습니까?");
      if (!ok) return;
    }

    const prev = members;
    setMembers((cur) => cur.map((m) => (m.id === id ? { ...m, active } : m)));

    markSaving(id, true);
    try {
      const updated = await patchMemberActive(id, active);
      setMembers((cur) => cur.map((m) => (m.id === id ? updated : m)));
    } catch (e: any) {
      setMembers(prev);
      alert(e?.response?.data?.message || "active 변경 실패");
    } finally {
      markSaving(id, false);
    }
  };

  return (
    <div className="pt-24 md:pt-28 max-w-6xl mx-auto px-4 sm:px-6">
      {/* ✅ 제목/설명 */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 break-keep">
          회원 관리
        </h1>
        <p className="text-sm text-gray-500 font-bold break-keep whitespace-normal">
          운영 기본: 활성(ON) 회원이 위에 오도록 정렬됩니다.
        </p>
      </div>

      {/* ✅ 컨트롤: 모바일 세로 스택 / 데스크탑 가로 */}
      <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* 검색 */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="이름/이메일/부서/기수/grade/role 검색"
          className="w-full md:w-96 px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-700 placeholder:text-gray-300"
        />

        {/* 옵션들 */}
        <div className="flex flex-wrap items-center gap-2 justify-start md:justify-end">
          <button
            onClick={() => setActiveFirst((v) => !v)}
            className={`px-4 py-3 rounded-2xl border text-sm font-black transition-all ${
              activeFirst
                ? "border-purple-200 text-[#813eb6] bg-purple-50"
                : "border-gray-200 text-gray-600 bg-white hover:text-[#813eb6] hover:border-purple-200"
            }`}
            title="활성 회원을 위로 정렬"
          >
            활성우선 {activeFirst ? "ON" : "OFF"}
          </button>

          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-black text-gray-700"
            title="정렬 기준"
          >
            <option value="generation">기수</option>
            <option value="name">이름</option>
            <option value="department">부서</option>
            <option value="grade">grade</option>
            <option value="role">role</option>
            <option value="active">활성</option>
          </select>

          <button
            onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
            className="px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-black text-gray-600 hover:text-[#813eb6] hover:border-purple-200 transition-all"
            title="정렬 방향"
          >
            {sortDir === "asc" ? "오름" : "내림"}
          </button>

          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-black text-gray-700"
            title="페이지당 개수"
          >
            <option value={10}>10개</option>
            <option value={20}>20개</option>
            <option value={30}>30개</option>
            <option value={50}>50개</option>
          </select>

          <button
            onClick={refresh}
            className="px-4 py-3 rounded-2xl border border-gray-200 bg-white font-black text-sm text-gray-600 hover:text-[#813eb6] hover:border-purple-200 transition-all"
          >
            새로고침
          </button>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-400 font-bold flex items-center justify-between">
        <span>
          검색 결과: {total} / 전체 {members.length}
        </span>
        <span>
          페이지: {safePage} / {totalPages}
        </span>
      </div>

      {/* ✅ 데스크탑( md 이상 ) : 테이블 */}
      <div className="mt-4 hidden md:block bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs font-black text-gray-500">
              <th className="px-4 py-3">이름</th>
              <th className="px-4 py-3">이메일</th>
              <th className="px-4 py-3">기수</th>
              <th className="px-4 py-3">부서</th>
              <th className="px-4 py-3">grade</th>
              <th className="px-4 py-3">role</th>
              <th className="px-4 py-3">활성</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-sm text-gray-400 font-bold">
                  불러오는 중...
                </td>
              </tr>
            ) : pageMembers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-sm text-gray-400 font-bold">
                  검색 결과가 없습니다.
                </td>
              </tr>
            ) : (
              pageMembers.map((m) => {
                const isSaving = savingIds.has(m.id);
                const isSuperAdmin = m.role === "ROLE_SUPER_ADMIN";

                return (
                  <tr key={m.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 text-sm font-bold text-gray-800">{m.name}</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-700">{m.email}</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-700">{m.generation}</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-700">{m.department}</td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <select
                          value={m.grade ?? "활동기수"}
                          disabled={isSaving}
                          onChange={(e) => onChangeGrade(m.id, e.target.value)}
                          className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-black text-gray-700"
                        >
                          {gradeOptions.map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>

                        {isSaving && <span className="text-xs font-black text-gray-400">저장중...</span>}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full border border-gray-200 bg-gray-50 text-xs font-black text-gray-700">
                        {roleLabel(m.role)}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={m.active === true}
                          disabled={isSaving || isSuperAdmin}
                          onChange={(e) => onToggleActive(m.id, e.target.checked)}
                          className="scale-110"
                        />
                        <span className="text-xs font-black text-gray-700">
                          {m.active === true ? "ON" : "OFF"}
                        </span>
                        {isSuperAdmin && (
                          <span className="text-xs font-black text-gray-400">(마스터 고정)</span>
                        )}
                      </label>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ 모바일( md 미만 ) : 카드 리스트 */}
      <div className="mt-4 md:hidden space-y-3">
        {loading ? (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 text-sm text-gray-400 font-bold">
            불러오는 중...
          </div>
        ) : pageMembers.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 text-sm text-gray-400 font-bold">
            검색 결과가 없습니다.
          </div>
        ) : (
          pageMembers.map((m) => {
            const isSaving = savingIds.has(m.id);
            const isSuperAdmin = m.role === "ROLE_SUPER_ADMIN";

            return (
              <div key={m.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-base font-black text-gray-900 break-keep">{m.name}</div>
                    <div className="mt-1 text-xs font-bold text-gray-500 break-all">{m.email}</div>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-black text-gray-700">
                      <span className="px-2 py-1 rounded-full bg-gray-50 border border-gray-100">
                        {m.generation}기
                      </span>
                      <span className="px-2 py-1 rounded-full bg-gray-50 border border-gray-100">
                        {m.department}
                      </span>
                      <span className="px-2 py-1 rounded-full bg-gray-50 border border-gray-100">
                        {m.active ? "활성" : "비활성"}
                      </span>
                    </div>
                  </div>

                  <span className="shrink-0 inline-flex items-center px-3 py-1 rounded-full border border-gray-200 bg-gray-50 text-xs font-black text-gray-700">
                    {roleLabel(m.role)}
                  </span>
                </div>

                <div className="mt-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-black text-gray-500">grade</span>
                    <select
                      value={m.grade ?? "활동기수"}
                      disabled={isSaving}
                      onChange={(e) => onChangeGrade(m.id, e.target.value)}
                      className="w-48 max-w-[70%] px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-black text-gray-700"
                    >
                      {gradeOptions.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-black text-gray-500">활성</span>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={m.active === true}
                        disabled={isSaving || isSuperAdmin}
                        onChange={(e) => onToggleActive(m.id, e.target.checked)}
                        className="scale-110"
                      />
                      <span className="text-xs font-black text-gray-700">
                        {m.active === true ? "ON" : "OFF"}
                      </span>
                    </label>
                  </div>

                  {isSaving && <div className="text-xs font-black text-gray-400">저장중...</div>}

                  {isSuperAdmin && (
                    <div className="text-xs font-bold text-gray-400">
                      * 마스터 계정은 비활성화할 수 없습니다.
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ✅ 페이지네이션 UI */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => goPage(1)}
          disabled={safePage === 1}
          className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-black text-gray-600 disabled:opacity-40"
        >
          처음
        </button>
        <button
          onClick={() => goPage(safePage - 1)}
          disabled={safePage === 1}
          className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-black text-gray-600 disabled:opacity-40"
        >
          이전
        </button>

        <span className="px-4 py-2 text-sm font-black text-gray-700">
          {safePage} / {totalPages}
        </span>

        <button
          onClick={() => goPage(safePage + 1)}
          disabled={safePage === totalPages}
          className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-black text-gray-600 disabled:opacity-40"
        >
          다음
        </button>
        <button
          onClick={() => goPage(totalPages)}
          disabled={safePage === totalPages}
          className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-black text-gray-600 disabled:opacity-40"
        >
          마지막
        </button>
      </div>

      <p className="mt-3 text-xs text-gray-400 font-bold break-keep">
        * 변경은 즉시 서버에 반영됩니다. (활성 회원 우선 정렬 적용)
      </p>
    </div>
  );
}
