import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type {
  RecruitBlockRequest,
  RecruitPost,
  RecruitPostUpsertRequest,
} from "../api/recruitApi";
import { createRecruitPost, getRecruitPost, updateRecruitPost } from "../api/recruitApi";
import { normalizeSortOrder } from "../lib/blockUtils";
import BlockEditor from "../components/BlockEditor";
import useS3Upload from "../hooks/useS3Upload";

type Props = { mode: "create" | "edit" };

function isAdminRole(role?: string | null) {
  return role === "ROLE_SUPER_ADMIN" || role === "ROLE_PRESIDENT";
}

function handleHttpError(e: any, navigate: (to: string, opt?: any) => void) {
  const status = e?.response?.status;
  if (status === 401) return alert("로그인이 필요합니다."), navigate("/login");
  if (status === 403) return alert("권한이 없습니다.");
  alert(e?.response?.data?.message || "요청 처리 중 오류가 발생했습니다.");
}

/** 비밀번호: 한글/이모지 입력 방지 (영문/숫자/기본 특수문자만 허용) */
function onlyPw(v: string) {
  return v.replace(/[^A-Za-z0-9!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|`~]/g, "");
}

export default function QaUpsertPage({ mode }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const routePostId = useMemo(() => Number(id), [id]);

  const queryPassword = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return sp.get("password") ?? "";
  }, [location.search]);

  const { user, loading: authLoading } = useAuth();
  const uploader = useS3Upload();

  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);

  const [post, setPost] = useState<RecruitPost | null>(null);
  const [draftId, setDraftId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [pinned, setPinned] = useState(false);
  const [blocks, setBlocks] = useState<RecruitBlockRequest[]>([
    { type: "TEXT", sortOrder: 0, text: "" },
  ]);

  const [authorName, setAuthorName] = useState("");
  const [secret, setSecret] = useState(true);
  const [password, setPassword] = useState("");

  // ✅ 요구사항: 작성 시작(gate) 먼저 → 그 다음 editor (로그인/비로그인 모두 gate부터)
  const [step, setStep] = useState<"gate" | "editor">(mode === "edit" ? "editor" : "gate");

  const postId = mode === "edit" ? routePostId : draftId;

  // ✅ auth 로딩 끝났을 때 gate 정책 유지
  useEffect(() => {
    if (mode !== "create") return;
    if (authLoading) return;
    setStep("gate");
  }, [mode, authLoading]);

  // ✅ edit 로드
  useEffect(() => {
    if (mode !== "edit") return;
    if (!Number.isFinite(routePostId)) return;

    void (async () => {
      setLoading(true);
      try {
        const data = await getRecruitPost(routePostId, queryPassword || undefined);
        setPost(data);

        setTitle(data.title);
        setPinned(data.pinned);
        setSecret(!!data.secret);

        if (data.authorType === "GUEST") setAuthorName(data.authorName ?? "");

        const mapped = (data.blocks ?? [])
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((b) => ({
            type: b.type,
            sortOrder: b.sortOrder,
            text: b.text ?? undefined,
            url: b.url ?? undefined,
            meta: b.meta ?? undefined,
          }));

        setBlocks(mapped.length ? mapped : [{ type: "TEXT", sortOrder: 0, text: "" }]);
      } catch (e: any) {
        handleHttpError(e, navigate);
      } finally {
        setLoading(false);
      }
    })();
  }, [mode, routePostId, navigate, queryPassword]);

  // ✅ gate에서 “작성 시작” 눌렀을 때만 draft 생성
  const onStartDraft = async () => {
    const isGuest = !user;

    if (!title.trim()) return alert("제목을 입력해주세요.");

    if (isGuest) {
      if (!authorName.trim()) return alert("작성자 이름을 입력해주세요.");
      if (secret && !password.trim()) return alert("비밀글 비밀번호가 필요합니다.");
    }

    try {
      // 서버 @NotBlank 회피용 (UI에는 박지 않음)
      const serverDraftTitle = "__DRAFT__";

      const created = await createRecruitPost("QA", {
        title: serverDraftTitle,
        pinned: false,
        authorName: isGuest ? authorName.trim() : undefined,
        secret,
        password: isGuest && secret ? password.trim() : undefined,
      });

      setDraftId(created.id);
      setStep("editor");
    } catch (e: any) {
      handleHttpError(e, navigate);
    }
  };

  const onSubmit = async () => {
    if (!title.trim()) return alert("제목을 입력해주세요.");
    if (uploader.isUploading) return alert("파일 업로드가 끝난 뒤 저장할 수 있어요.");
    if (!postId) return alert("게시글 ID 생성 중입니다. 잠시 후 다시 시도해주세요.");

    const isGuest = !user;

    if (isGuest) {
      if (!authorName.trim()) return alert("작성자 이름을 입력해주세요.");
      if (secret && !password.trim()) return alert("비밀글 비밀번호가 필요합니다.");
    }

    const normalized = normalizeSortOrder(blocks)
      .filter((b) =>
        b.type === "TEXT"
          ? (b.text ?? "").trim().length > 0
          : !!(b.url && b.url.trim())
      )
      .map((b) => ({
        ...b,
        text: b.type === "TEXT" ? (b.text ?? "") : undefined,
        url: b.type !== "TEXT" ? (b.url ?? "") : undefined,
      }));

    const req: RecruitPostUpsertRequest = {
      title: title.trim(),
      pinned: isAdminRole(user?.role) ? pinned : false,
      blocks: normalized,

      // ✅ 로그인 유저도 secret 가능 (비번은 게스트만)
      secret,

      authorName: isGuest ? authorName.trim() : undefined,
      password: isGuest && secret ? password.trim() : undefined,
    };

    setSaving(true);
    try {
      const pwForUpdate =
        mode === "edit" && post?.authorType === "GUEST"
          ? (queryPassword || password).trim() || undefined
          : undefined;

      await updateRecruitPost(postId, req, pwForUpdate);
      navigate(`/recruit/qa/${postId}`, { replace: true });
    } catch (e: any) {
      handleHttpError(e, navigate);
    } finally {
      setSaving(false);
    }
  };

  const pageTitle = mode === "create" ? "질문 작성" : "질문 수정";
  const ready = !(loading || authLoading || (mode === "create" && step === "editor" && postId == null));

  return (
    <div className="pt-24 md:pt-28 max-w-5xl mx-auto px-4 sm:px-6 pb-24">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-xs font-black text-[#813eb6]">
              Recruit
            </span>
            <span className="text-xs font-black text-gray-400">Q&amp;A</span>
          </div>
          <h1 className="mt-2 text-2xl md:text-3xl font-black text-gray-900">{pageTitle}</h1>
          <p className="mt-1 text-sm font-bold text-gray-500">
            질문을 남기면 운영진이 확인 후 답변합니다. 비밀글은 보호됩니다.
          </p>
        </div>

        <button
          onClick={() => navigate("/recruit/qa")}
          className="shrink-0 px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-black text-gray-600 hover:text-[#813eb6] hover:border-purple-200 transition-all"
        >
          목록으로
        </button>
      </div>

      {!ready ? (
        <div className="mt-6 bg-white border border-gray-100 rounded-2xl shadow-sm p-6 text-sm font-bold text-gray-400">
          준비 중...
        </div>
      ) : (
        <>
          {mode === "create" && step === "gate" ? (
            <div className="mt-6 bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="text-lg font-black text-gray-900">작성 설정</div>
                <p className="mt-1 text-sm font-bold text-gray-500">
                  작성 시작을 누르면 에디터가 열리고, 첨부 업로드가 가능합니다.
                </p>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-12">
                    <div className="text-xs font-black text-gray-400 mb-2">TITLE</div>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="질문 제목을 입력하세요"
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-200"
                    />
                  </div>

                  <div className="md:col-span-12 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={secret}
                      onChange={(e) => setSecret(e.target.checked)}
                      className="scale-110"
                    />
                    <span className="text-sm font-black text-gray-700">🔒 비밀글</span>
                  </div>

                  {!user && (
                    <>
                      <div className="md:col-span-5">
                        <div className="text-xs font-black text-gray-400 mb-2">AUTHOR</div>
                        <input
                          value={authorName}
                          onChange={(e) => setAuthorName(e.target.value)}
                          placeholder="작성자 이름"
                          className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-200"
                        />
                      </div>

                      {secret && (
                        <div className="md:col-span-7">
                          <div className="text-xs font-black text-gray-400 mb-2">PASSWORD</div>
                          <input
                            value={password}
                            onChange={(e) => setPassword(onlyPw(e.target.value))}
                            type="password"
                            placeholder="비밀번호 (영문/숫자/특수문자)"
                            className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-200"
                            inputMode="text"
                            autoCapitalize="none"
                            autoCorrect="off"
                            spellCheck={false}
                          />
                          <div className="mt-1 text-[11px] font-bold text-gray-500">
                            비밀번호는 영문/숫자/특수문자만 입력 가능합니다.
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {user && secret && (
                    <div className="md:col-span-12 text-xs font-bold text-gray-500">
                      로그인 사용자는 비밀번호 없이도 비밀글 작성이 가능합니다.
                    </div>
                  )}
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    onClick={onStartDraft}
                    className="px-6 py-3 rounded-2xl bg-[#813eb6] text-white text-sm font-black shadow-lg shadow-purple-100 hover:bg-[#3d1d56] transition-all"
                  >
                    작성 시작
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="mt-6 bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                <div className="p-5 md:p-6 border-b border-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-8">
                      <div className="text-xs font-black text-gray-400 mb-2">TITLE</div>
                      <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="질문 제목을 입력하세요"
                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-200"
                      />
                    </div>

                    <div className="md:col-span-4 flex items-center justify-between md:justify-end gap-4 md:mt-6">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={pinned}
                          onChange={(e) => setPinned(e.target.checked)}
                          className="scale-110"
                          disabled={!isAdminRole(user?.role)}
                          title={!isAdminRole(user?.role) ? "FAQ 고정은 관리자만 가능합니다." : undefined}
                        />
                        <span className="text-sm font-black text-gray-700">⭐ FAQ 고정</span>
                      </label>

                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={secret}
                          onChange={(e) => setSecret(e.target.checked)}
                          className="scale-110"
                        />
                        <span className="text-sm font-black text-gray-700">🔒 비밀글</span>
                      </label>
                    </div>
                  </div>

                  {/* edit 모드에서 게스트 글이라면 (queryPassword 없을 때) */}
                  {mode === "edit" && post?.authorType === "GUEST" && !queryPassword && (
                    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <div className="text-sm font-black text-amber-900">비밀글 수정</div>
                      <div className="mt-1 text-xs font-bold text-amber-700">
                        게스트 비밀글은 비밀번호가 필요합니다. (상세에서 열람 후 수정으로 진입하세요)
                      </div>
                    </div>
                  )}

                  {/* editor 화면에서도 비밀번호 입력은 “게스트 + 비밀글”일 때만 */}
                  {!user && secret && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-3">
                      <div className="md:col-span-5">
                        <div className="text-xs font-black text-gray-400 mb-2">AUTHOR</div>
                        <input
                          value={authorName}
                          onChange={(e) => setAuthorName(e.target.value)}
                          placeholder="작성자 이름"
                          className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-800 placeholder:text-gray-300"
                        />
                      </div>

                      <div className="md:col-span-7">
                        <div className="text-xs font-black text-gray-400 mb-2">PASSWORD</div>
                        <input
                          value={password}
                          onChange={(e) => setPassword(onlyPw(e.target.value))}
                          type="password"
                          placeholder="비밀번호 (영문/숫자/특수문자)"
                          className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-800 placeholder:text-gray-300"
                          inputMode="text"
                          autoCapitalize="none"
                          autoCorrect="off"
                          spellCheck={false}
                        />
                        <div className="mt-1 text-[11px] font-bold text-gray-500">
                          비밀번호는 영문/숫자/특수문자만 입력 가능합니다.
                        </div>
                      </div>
                    </div>
                  )}

                  {user && secret && (
                    <div className="mt-4 text-xs font-bold text-gray-500">
                      로그인 사용자는 비밀번호 없이도 비밀글 작성이 가능합니다.
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <BlockEditor
                  boardCode="QA"
                  postId={postId!}
                  value={blocks}
                  onChange={setBlocks}
                  disabled={saving}
                />
              </div>

              <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-end gap-2">
                <button
                  onClick={() => navigate("/recruit/qa")}
                  className="px-5 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-black text-gray-600 hover:text-[#813eb6] hover:border-purple-200 transition-all"
                >
                  취소
                </button>
                <button
                  disabled={saving || uploader.isUploading}
                  onClick={onSubmit}
                  className="px-6 py-3 rounded-2xl bg-[#813eb6] text-white text-sm font-black shadow-lg shadow-purple-100 hover:bg-[#3d1d56] transition-all disabled:opacity-60"
                >
                  {uploader.isUploading ? "업로드 중..." : saving ? "저장중..." : "저장"}
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
