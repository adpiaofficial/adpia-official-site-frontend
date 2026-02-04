import { useEffect, useMemo, useState } from "react";
import BlockEditor from "../components/BlockEditor";
import { normalizeExternalUrl } from "../lib/url";
import { getRecruitPosts, type RecruitPost, type PageResponse } from "../api/recruitApi";
import {
  getAdminPopup,
  saveAdminPopup,
  type PopupDetailLinkType,
  type PopupResponse,
  type PopupUpsertRequest,
} from "../api/popupApi";

type PostOption = { id: number; title: string };

type FormState = {
  title: string;
  active: boolean; // ✅ popupApi.ts 기준: active

  startAt: string; // input datetime-local
  endAt: string;

  detailLabel: string;
  detailLinkType: PopupDetailLinkType;

  // ✅ NOTICE/QA는 targetId, PAGE/EXTERNAL은 url
  detailTargetId: number | null;
  detailUrl: string;

  blocks: any[]; // RecruitBlockRequest[]로 바꿔도 됨
};

function toInputDateTime(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function toIsoOrNull(v: string) {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export default function AdminPopupEditPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [serverPopup, setServerPopup] = useState<PopupResponse | null>(null);

  // ✅ NOTICE/QA 드롭다운 데이터
  const [noticeOptions, setNoticeOptions] = useState<PostOption[]>([]);
  const [qaOptions, setQaOptions] = useState<PostOption[]>([]);
  const [postKeyword, setPostKeyword] = useState("");
  const [postLoading, setPostLoading] = useState(false);

  const [form, setForm] = useState<FormState>({
    title: "메인 팝업",
    active: true,

    startAt: "",
    endAt: "",

    detailLabel: "자세히보기",
    detailLinkType: "NONE",

    detailTargetId: null,
    detailUrl: "",

    blocks: [],
  });

  // ✅ 서버 팝업 로드(편집용)
  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      try {
        const p = await getAdminPopup();
        if (!alive) return;

        setServerPopup(p);

        if (p) {
          setForm({
            title: p.title ?? " ",
            active: !!p.active,

            startAt: toInputDateTime(p.startAt),
            endAt: toInputDateTime(p.endAt),

            detailLabel: p.detailLabel ?? "자세히보기",
            detailLinkType: p.detailLinkType ?? "NONE",

            detailTargetId: p.detailTargetId ?? null,
            detailUrl: p.detailUrl ?? "",

            blocks: p.blocks ?? [],
          });
        }
      } catch {
        // 로드 실패해도 작성은 가능
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // ✅ detailLinkType이 NOTICE/QA면 최근 15개 로드
  useEffect(() => {
    const load = async () => {
      if (form.detailLinkType !== "NOTICE" && form.detailLinkType !== "QA") return;

      setPostLoading(true);
      try {
        const boardCode = form.detailLinkType === "NOTICE" ? "NOTICE" : "QA";
        const data: PageResponse<RecruitPost> = await getRecruitPosts(boardCode as any, 0, 15);

        const mapped: PostOption[] = (data.content ?? []).map((p) => ({
          id: p.id,
          title: p.title,
        }));

        if (form.detailLinkType === "NOTICE") setNoticeOptions(mapped);
        else setQaOptions(mapped);
      } catch {
        // ignore
      } finally {
        setPostLoading(false);
      }
    };

    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.detailLinkType]);

  const options = useMemo(() => {
    if (form.detailLinkType === "NOTICE") return noticeOptions;
    if (form.detailLinkType === "QA") return qaOptions;
    return [];
  }, [form.detailLinkType, noticeOptions, qaOptions]);

  const filteredOptions = useMemo(() => {
    const k = postKeyword.trim().toLowerCase();
    if (!k) return options;
    return options.filter((o) => o.title.toLowerCase().includes(k));
  }, [options, postKeyword]);

  const canSave = useMemo(() => {
    if (!form.title.trim()) return false;

    // NONE면 추가 체크 없음
    if (form.detailLinkType === "NONE") return true;

    // NOTICE/QA는 targetId 필수
    if ((form.detailLinkType === "NOTICE" || form.detailLinkType === "QA") && !form.detailTargetId)
      return false;

    // PAGE/EXTERNAL은 url 필수
    if ((form.detailLinkType === "PAGE" || form.detailLinkType === "EXTERNAL") && !form.detailUrl.trim())
      return false;

    return true;
  }, [form]);

  const onSave = async () => {
    if (!canSave) return;

    // ✅ url normalize (PAGE/EXTERNAL만)
    let detailUrl = form.detailUrl.trim();
    if (form.detailLinkType === "EXTERNAL") {
      const fixed = normalizeExternalUrl(detailUrl);
      if (!fixed) return alert("외부 링크는 https://... 형식이어야 합니다.");
      detailUrl = fixed;
    } else if (form.detailLinkType === "PAGE") {
      // 내부 페이지는 "/"로 시작하도록
      if (!detailUrl.startsWith("/")) detailUrl = `/${detailUrl}`;
    }

    const payload: PopupUpsertRequest = {
      title: form.title.trim(),
      active: form.active,

      startAt: toIsoOrNull(form.startAt),
      endAt: toIsoOrNull(form.endAt),

      blocks: form.blocks ?? [],

      detailLabel: form.detailLinkType === "NONE" ? null : form.detailLabel.trim() || "자세히보기",
      detailLinkType: form.detailLinkType,

      detailTargetId:
        form.detailLinkType === "NOTICE" || form.detailLinkType === "QA"
          ? form.detailTargetId
          : null,

      detailUrl:
        form.detailLinkType === "PAGE" || form.detailLinkType === "EXTERNAL"
          ? detailUrl
          : null,
    };

    setSaving(true);
    try {
      const saved = await saveAdminPopup(payload);
      setServerPopup(saved);
      alert("저장 완료!");
    } catch (e: any) {
      alert(e?.response?.data?.message || "저장 실패");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-24 md:pt-28 max-w-5xl mx-auto px-4 sm:px-6 pb-24">
        <div className="h-40 rounded-3xl border border-gray-100 bg-white shadow-sm animate-pulse" />
      </div>
    );
  }

  return (
    <div className="pt-24 md:pt-28 max-w-5xl mx-auto px-4 sm:px-6 pb-24">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900">팝업 관리</h1>
          <div className="mt-2 text-sm font-bold text-gray-400">
            메인페이지 팝업을 블록 형태로 작성하고, “자세히보기” 링크를 설정할 수 있어요.
          </div>
        </div>

        <button
          onClick={onSave}
          disabled={!canSave || saving}
          className="px-5 py-3 rounded-2xl bg-[#813eb6] text-white font-black shadow hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "저장 중..." : "저장"}
        </button>
      </div>

      {/* 설정 카드 */}
      <div className="mt-6 rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 제목 */}
            <div>
              <div className="text-xs font-black text-gray-500 mb-2">팝업 제목</div>
              <input
                value={form.title}
                onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-200"
                placeholder="예: 34기 신입모집 안내"
              />
            </div>

            {/* 활성 */}
            <div className="flex items-end gap-3">
              <label className="flex items-center gap-2 text-sm font-black text-gray-700">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((s) => ({ ...s, active: e.target.checked }))}
                  className="w-5 h-5"
                />
                활성화(ON)
              </label>
              <div className="text-xs font-bold text-gray-400">OFF면 메인에 안 뜸</div>
            </div>

            {/* 노출 기간 */}
            <div>
              <div className="text-xs font-black text-gray-500 mb-2">시작(선택)</div>
              <input
                type="datetime-local"
                value={form.startAt}
                onChange={(e) => setForm((s) => ({ ...s, startAt: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-800"
              />
            </div>
            <div>
              <div className="text-xs font-black text-gray-500 mb-2">종료(선택)</div>
              <input
                type="datetime-local"
                value={form.endAt}
                onChange={(e) => setForm((s) => ({ ...s, endAt: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-800"
              />
            </div>

            {/* 자세히보기 설정 */}
            <div className="md:col-span-2 mt-2">
              <div className="text-xs font-black text-gray-500 mb-2">자세히보기 버튼</div>

              <div className="flex flex-col md:flex-row gap-3">
                <select
                  value={form.detailLinkType}
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      detailLinkType: e.target.value as PopupDetailLinkType,
                      // 타입 바뀌면 값 정리
                      detailTargetId: null,
                      detailUrl: "",
                    }))
                  }
                  className="px-4 py-3 rounded-2xl border border-gray-200 text-sm font-black text-gray-800"
                >
                  <option value="NOTICE">공지사항 글로 이동</option>
                  <option value="QA">Q&A 글로 이동</option>
                  <option value="PAGE">내부 페이지 이동</option>
                  <option value="EXTERNAL">외부 링크 열기</option>
                  <option value="NONE">버튼 없음</option>
                </select>

                <input
                  value={form.detailLabel}
                  onChange={(e) => setForm((s) => ({ ...s, detailLabel: e.target.value }))}
                  disabled={form.detailLinkType === "NONE"}
                  className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-800 disabled:bg-gray-50"
                  placeholder="버튼 라벨 (예: 자세히보기)"
                />
              </div>

              {/* ✅ NOTICE/QA: 검색 + 드롭다운 */}
              {(form.detailLinkType === "NOTICE" || form.detailLinkType === "QA") && (
                <div className="mt-3">
                  <div className="text-[11px] font-bold text-gray-400 mb-2">
                    제목으로 검색 후 선택하세요 (최근 15개)
                  </div>

                  <div className="flex flex-col md:flex-row gap-3">
                    <input
                      value={postKeyword}
                      onChange={(e) => setPostKeyword(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-800"
                      placeholder="제목 검색 (예: 신입 모집)"
                    />

                    <select
                      value={form.detailTargetId ?? ""}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          detailTargetId: e.target.value ? Number(e.target.value) : null,
                        }))
                      }
                      className="flex-[2] px-4 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-800"
                    >
                      <option value="">
                        {postLoading ? "불러오는 중..." : "게시글을 선택하세요"}
                      </option>

                      {filteredOptions.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.title.length > 50 ? o.title.slice(0, 50) + "…" : o.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {form.detailTargetId && (
                    <div className="mt-2 text-[11px] font-bold text-gray-500">
                      선택됨: <span className="text-gray-800">#{form.detailTargetId}</span>
                    </div>
                  )}
                </div>
              )}

              {/* ✅ PAGE/EXTERNAL: URL 입력 */}
              {(form.detailLinkType === "PAGE" || form.detailLinkType === "EXTERNAL") && (
                <div className="mt-3">
                  <div className="text-[11px] font-bold text-gray-400 mb-2">
                    {form.detailLinkType === "EXTERNAL"
                      ? "외부 링크(https://...)를 입력하세요."
                      : "내부 경로(/로 시작)를 입력하세요."}
                  </div>

                  <input
                    value={form.detailUrl}
                    onChange={(e) => setForm((s) => ({ ...s, detailUrl: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-800"
                    placeholder={form.detailLinkType === "EXTERNAL" ? "https://..." : "/recruit/notice/1"}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 본문(블록 에디터 재사용) */}
      <div className="mt-6">
        <BlockEditor
          boardCode={"NOTICE" as any} // 팝업도 업로드를 쓰려면 boardCode 필요 → 임시로 NOTICE 재사용
          postId={serverPopup?.id ?? 0} // 업로드가 id 기반이면, 현재 팝업 id 없을 때는 0(백쪽에서 보완하면 더 완벽)
          value={form.blocks}
          onChange={(next) => setForm((s) => ({ ...s, blocks: next }))}
          disabled={saving}
        />
      </div>
    </div>
  );
}
