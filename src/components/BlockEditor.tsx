// src/components/BlockEditor.tsx
import React, { useRef, useState } from "react";
import type { RecruitBlockRequest, RecruitBlockType, RecruitBoardCode } from "../api/recruitApi";
import { normalizeSortOrder } from "../lib/blockUtils";
import useS3Upload, { type UploadBlockType } from "../hooks/useS3Upload";
import { getLinkPreview } from "../api/linkApi";
import { normalizeExternalUrl } from "../lib/url";
import RichTextView from "./RichTextView";

type Props = {
  boardCode: RecruitBoardCode;
  postId: number;
  value: RecruitBlockRequest[];
  onChange: (next: RecruitBlockRequest[]) => void;
  disabled?: boolean;
};

const blockTypeLabel: Record<RecruitBlockType, string> = {
  TEXT: "텍스트",
  IMAGE: "이미지",
  VIDEO: "영상",
  FILE: "파일(PDF 등)",
  EMBED: "임베드",
  LINK: "링크",
};

function newBlock(type: RecruitBlockType, sortOrder: number): RecruitBlockRequest {
  if (type === "TEXT") return { type, sortOrder, text: "" };
  return { type, sortOrder, url: "" };
}

function makeFileMeta(file: File, key?: string) {
  return JSON.stringify({
    key,
    originalFilename: file.name,
    contentType: file.type || "application/octet-stream",
    size: file.size,
  });
}

function mergeMeta(prevMeta: string | undefined, patch: Record<string, any>) {
  let base: any = {};
  try {
    base = prevMeta ? JSON.parse(prevMeta) : {};
  } catch {
    base = {};
  }
  return JSON.stringify({ ...base, ...patch });
}

function normalizeHexColor(input: string) {
  const v = (input || "").trim();
  if (/^#([0-9a-fA-F]{6})$/.test(v)) return v;
  return null;
}

function normalizeFontSizePx(input: string) {
  const n = Number(String(input).trim());
  if (!Number.isFinite(n)) return null;
  const clamped = Math.max(12, Math.min(28, Math.round(n)));
  return clamped;
}

function RichTextPreview({ value }: { value: string }) {
  const text = (value ?? "").trim();
  if (!text) return null;

  return (
    <div className="mt-3 rounded-2xl border border-gray-100 bg-white p-4">
      <div className="text-xs font-black text-gray-500 mb-2">미리보기</div>
      <div className="text-[15px] font-medium text-gray-800 leading-relaxed">
        <RichTextView value={text} />
      </div>
    </div>
  );
}

export default function BlockEditor({ boardCode, postId, value, onChange, disabled }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const fileAnyInputRef = useRef<HTMLInputElement | null>(null);

  const textAreaRefs = useRef<Record<number, HTMLTextAreaElement | null>>({});

  const uploader = useS3Upload();
  const blocks = value;

  const [openPanelIdx, setOpenPanelIdx] = useState<number | null>(null);
  const [panelType, setPanelType] = useState<"COLOR" | "HIGHLIGHT" | "FONTSIZE" | null>(null);

  const [pickedColor, setPickedColor] = useState<string>("#813eb6");
  const [pickedBg, setPickedBg] = useState<string>("#fff3a3");
  const [fontSizeInput, setFontSizeInput] = useState<string>("15");

  const isUploading = uploader.isUploading;

  const addBlock = (type: RecruitBlockType) => {
    onChange(normalizeSortOrder([...blocks, newBlock(type, blocks.length)]));
  };

  const removeBlock = (idx: number) => {
    onChange(normalizeSortOrder(blocks.filter((_, i) => i !== idx)));
  };

  const moveBlock = (idx: number, dir: -1 | 1) => {
    const to = idx + dir;
    if (to < 0 || to >= blocks.length) return;
    const next = [...blocks];
    const tmp = next[idx];
    next[idx] = next[to];
    next[to] = tmp;
    onChange(normalizeSortOrder(next));
  };

  const patchBlock = (idx: number, patch: Partial<RecruitBlockRequest>) => {
    const next = [...blocks];
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  };

  const insertUploadedBlock = (
    insertAt: number | null,
    payload: { blockType: UploadBlockType; fileUrl: string; uploadId: string; file: File; key?: string }
  ) => {
    const block: RecruitBlockRequest = {
      type: payload.blockType,
      sortOrder: 0,
      url: payload.fileUrl,
      meta: makeFileMeta(payload.file, payload.key),
    };

    const next =
      insertAt == null
        ? [...blocks, block]
        : [...blocks.slice(0, insertAt), block, ...blocks.slice(insertAt)];

    onChange(normalizeSortOrder(next));
  };

  const onPickFiles = async (files: FileList | null, insertAt: number | null) => {
    if (!files || files.length === 0) return;

    if (!postId || postId <= 0) {
      alert("먼저 '작성 시작'으로 글을 생성한 뒤 업로드할 수 있어요.");
      return;
    }

    const arr = Array.from(files);

    let at = insertAt;
    for (const file of arr) {
      const result = await uploader.addAndUpload({ boardCode, postId, file });

      insertUploadedBlock(at, {
        blockType: result.blockType,
        fileUrl: result.fileUrl,
        uploadId: result.uploadId,
        file,
        key: result.key,
      });

      if (at != null) at += 1;
    }
  };

  const handleTextPaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>, insertAt: number | null) => {
    if (disabled) return;

    const items = e.clipboardData?.items;
    if (!items) return;

    const images: File[] = [];
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        const f = item.getAsFile();
        if (f) images.push(f);
      }
    }
    if (images.length === 0) return;

    e.preventDefault();

    if (!postId || postId <= 0) {
      alert("먼저 '작성 시작'으로 글을 생성한 뒤 업로드할 수 있어요.");
      return;
    }

    let at = insertAt;
    for (const file of images) {
      const result = await uploader.addAndUpload({ boardCode, postId, file });
      insertUploadedBlock(at, {
        blockType: result.blockType,
        fileUrl: result.fileUrl,
        uploadId: result.uploadId,
        file,
        key: result.key,
      });
      if (at != null) at += 1;
    }
  };

  const wrapSelection = (idx: number, left: string, right: string) => {
    const el = textAreaRefs.current[idx];
    const b = blocks[idx];
    if (!el || !b || b.type !== "TEXT") return;

    const text = b.text ?? "";
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;

    if (start !== end) {
      const selected = text.slice(start, end);
      const nextText = text.slice(0, start) + left + selected + right + text.slice(end);
      patchBlock(idx, { text: nextText });

      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(start + left.length, end + left.length);
      });
      return;
    }

    const insert = left + right;
    const nextText = text.slice(0, start) + insert + text.slice(end);
    patchBlock(idx, { text: nextText });

    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + left.length, start + left.length);
    });
  };

  const hydrateLinkMeta = async (idx: number) => {
    const b = blocks[idx];
    if (!b || b.type !== "LINK") return;

    const raw = normalizeExternalUrl(b.url ?? "");
    if (!raw) return;

    try {
      const currentMeta = b.meta ? JSON.parse(b.meta) : {};
      if (currentMeta?.title || currentMeta?.thumbnailUrl) return;
    } catch {}

    try {
      const p = await getLinkPreview(raw);
      const nextMeta = mergeMeta(b.meta, {
        title: p.title ?? undefined,
        desc: p.desc ?? undefined,
        siteName: p.siteName ?? undefined,
        thumbnailUrl: p.image ?? undefined,
        url: p.url ?? raw,
      });

      const normalizedFromServer = normalizeExternalUrl(p.url ?? "") ?? raw;
      patchBlock(idx, { meta: nextMeta, url: normalizedFromServer });
    } catch {}
  };

  const togglePanel = (idx: number, type: "COLOR" | "HIGHLIGHT" | "FONTSIZE") => {
    if (openPanelIdx === idx && panelType === type) {
      setOpenPanelIdx(null);
      setPanelType(null);
      return;
    }
    setOpenPanelIdx(idx);
    setPanelType(type);
  };

  const actionBtnCls =
    "px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-black text-gray-600 hover:text-[#813eb6] hover:border-purple-200 transition-all disabled:opacity-50";

  const miniBtnCls =
    "px-2.5 py-2 rounded-xl border border-gray-200 bg-white text-[11px] font-black text-gray-600 hover:text-[#813eb6] hover:border-purple-200 transition-all disabled:opacity-50";

  const cardCls = "bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden";

  return (
    <div className={cardCls}>
      <div className="p-4 md:p-5 border-b border-gray-50 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="text-sm font-black text-gray-900">Content Blocks</div>
          <div className="text-xs font-bold text-gray-400 mt-1">
            글/이미지/영상/PDF 등을 섞어서 순서대로 작성할 수 있어요. (드래그 대신 ↑↓)
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button className={actionBtnCls} disabled={disabled || isUploading} onClick={() => addBlock("TEXT")}>
            + 텍스트
          </button>

          <button className={actionBtnCls} disabled={disabled || isUploading} onClick={() => fileInputRef.current?.click()}>
            + 이미지
          </button>

          <button className={actionBtnCls} disabled={disabled || isUploading} onClick={() => videoInputRef.current?.click()}>
            + 영상
          </button>

          <button className={actionBtnCls} disabled={disabled || isUploading} onClick={() => fileAnyInputRef.current?.click()}>
            + 파일
          </button>

          <button className={actionBtnCls} disabled={disabled || isUploading} onClick={() => addBlock("EMBED")}>
            + 임베드
          </button>

          <button className={actionBtnCls} disabled={disabled || isUploading} onClick={() => addBlock("LINK")}>
            + 링크
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              void onPickFiles(e.target.files, null);
              e.currentTarget.value = "";
            }}
          />

          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            multiple
            className="hidden"
            onChange={(e) => {
              void onPickFiles(e.target.files, null);
              e.currentTarget.value = "";
            }}
          />

          <input
            ref={fileAnyInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              void onPickFiles(e.target.files, null);
              e.currentTarget.value = "";
            }}
          />
        </div>
      </div>

      <div className="p-4 md:p-5 space-y-3">
        {blocks.map((b, idx) => {
          const type = b.type;

          return (
            <div key={idx} className="border border-gray-100 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
                <div className="text-xs font-black text-gray-700">
                  {idx + 1}. {blockTypeLabel[type]}
                </div>
                <div className="flex items-center gap-2">
                  <button className={actionBtnCls} disabled={disabled || idx === 0} onClick={() => moveBlock(idx, -1)}>
                    ↑
                  </button>
                  <button
                    className={actionBtnCls}
                    disabled={disabled || idx === blocks.length - 1}
                    onClick={() => moveBlock(idx, 1)}
                  >
                    ↓
                  </button>
                  <button
                    className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-black text-gray-600 hover:text-red-500 transition-all disabled:opacity-50"
                    disabled={disabled || isUploading}
                    onClick={() => removeBlock(idx)}
                  >
                    삭제
                  </button>
                </div>
              </div>

              <div className="p-4">
                {type === "TEXT" ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <button type="button" className={miniBtnCls} disabled={disabled} onClick={() => wrapSelection(idx, "{b}", "{/b}")}>
                        굵게
                      </button>

                      <button type="button" className={miniBtnCls} disabled={disabled} onClick={() => togglePanel(idx, "FONTSIZE")}>
                        폰트크기
                      </button>

                      <button type="button" className={miniBtnCls} disabled={disabled} onClick={() => togglePanel(idx, "COLOR")}>
                        글자색
                      </button>

                      <button type="button" className={miniBtnCls} disabled={disabled} onClick={() => togglePanel(idx, "HIGHLIGHT")}>
                        하이라이트
                      </button>

                      <span className="text-[11px] font-bold text-gray-400">이미지 붙여넣기(Ctrl/⌘+V) 가능</span>
                    </div>

                    {openPanelIdx === idx && panelType === "FONTSIZE" && (
                      <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
                        <div className="text-xs font-black text-gray-700 mb-2">폰트 크기</div>

                        <div className="flex flex-wrap items-center gap-2">
                          {[12, 14, 16, 18, 22, 26].map((n) => (
                            <button key={n} className={miniBtnCls} onClick={() => wrapSelection(idx, `{fs:${n}}`, "{/fs}")}>
                              {n}
                            </button>
                          ))}

                          <div className="flex items-center gap-2 ml-2">
                            <input
                              value={fontSizeInput}
                              onChange={(e) => setFontSizeInput(e.target.value)}
                              className="w-20 px-3 py-2 rounded-xl border border-gray-200 text-xs font-black text-gray-700"
                              placeholder="12~28"
                            />
                            <button
                              className={miniBtnCls}
                              onClick={() => {
                                const px = normalizeFontSizePx(fontSizeInput);
                                if (!px) return alert("폰트 크기는 12~28 숫자만 가능해요.");
                                wrapSelection(idx, `{fs:${px}}`, "{/fs}");
                                setOpenPanelIdx(null);
                                setPanelType(null);
                              }}
                            >
                              적용
                            </button>
                          </div>
                        </div>

                        <div className="mt-2 text-[11px] font-bold text-gray-400">※ 안전 범위: 12~28px</div>
                      </div>
                    )}

                    {openPanelIdx === idx && panelType === "COLOR" && (
                      <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
                        <div className="text-xs font-black text-gray-700 mb-2">글자색 선택</div>

                        <div className="flex items-center gap-3 flex-wrap">
                          <input
                            type="color"
                            value={pickedColor}
                            onChange={(e) => setPickedColor(e.target.value)}
                            className="w-10 h-10 p-0 border-0 bg-transparent"
                            title="색상 선택"
                          />
                          <input
                            value={pickedColor}
                            onChange={(e) => setPickedColor(e.target.value)}
                            className="w-28 px-3 py-2 rounded-xl border border-gray-200 text-xs font-black text-gray-700"
                            placeholder="#RRGGBB"
                          />
                          <button
                            className={miniBtnCls}
                            onClick={() => {
                              const hex = normalizeHexColor(pickedColor);
                              if (!hex) return alert("색상은 #RRGGBB 형식만 가능해요.");
                              wrapSelection(idx, `{c:${hex}}`, "{/c}");
                              setOpenPanelIdx(null);
                              setPanelType(null);
                            }}
                          >
                            적용
                          </button>

                          <button className={miniBtnCls} onClick={() => setPickedColor("#813eb6")}>기본 보라</button>
                          <button className={miniBtnCls} onClick={() => setPickedColor("#111827")}>검정</button>
                          <button className={miniBtnCls} onClick={() => setPickedColor("#ef4444")}>빨강</button>
                          <button className={miniBtnCls} onClick={() => setPickedColor("#2563eb")}>파랑</button>
                          <button className={miniBtnCls} onClick={() => setPickedColor("#16a34a")}>초록</button>
                        </div>

                        <div className="mt-2 text-[11px] font-bold text-gray-400">저장 형식: {"{c:#RRGGBB}텍스트{/c}"}</div>
                      </div>
                    )}

                    {openPanelIdx === idx && panelType === "HIGHLIGHT" && (
                      <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
                        <div className="text-xs font-black text-gray-700 mb-2">하이라이트 선택</div>

                        <div className="flex items-center gap-3 flex-wrap">
                          <input
                            type="color"
                            value={pickedBg}
                            onChange={(e) => setPickedBg(e.target.value)}
                            className="w-10 h-10 p-0 border-0 bg-transparent"
                            title="하이라이트 색상 선택"
                          />
                          <input
                            value={pickedBg}
                            onChange={(e) => setPickedBg(e.target.value)}
                            className="w-28 px-3 py-2 rounded-xl border border-gray-200 text-xs font-black text-gray-700"
                            placeholder="#RRGGBB"
                          />
                          <button
                            className={miniBtnCls}
                            onClick={() => {
                              const hex = normalizeHexColor(pickedBg);
                              if (!hex) return alert("하이라이트는 #RRGGBB 형식만 가능해요.");
                              wrapSelection(idx, `{bg:${hex}}`, "{/bg}");
                              setOpenPanelIdx(null);
                              setPanelType(null);
                            }}
                          >
                            적용
                          </button>

                          <button className={miniBtnCls} onClick={() => setPickedBg("#fff3a3")}>노랑</button>
                          <button className={miniBtnCls} onClick={() => setPickedBg("#e9d5ff")}>보라</button>
                          <button className={miniBtnCls} onClick={() => setPickedBg("#e5e7eb")}>회색</button>
                        </div>

                        <div className="mt-2 text-[11px] font-bold text-gray-400">저장 형식: {"{bg:#RRGGBB}텍스트{/bg}"}</div>
                      </div>
                    )}

                    <textarea
                      ref={(el) => {
                        textAreaRefs.current[idx] = el;
                      }}
                      value={b.text ?? ""}
                      disabled={disabled}
                      onChange={(e) => patchBlock(idx, { text: e.target.value })}
                      onPaste={(e) => void handleTextPaste(e, idx + 1)}
                      placeholder="텍스트 입력 후, 위 버튼으로 굵기/크기/색상/하이라이트 적용"
                      className="w-full min-h-[140px] px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-200"
                    />

                    <RichTextPreview value={b.text ?? ""} />
                  </div>
                ) : type === "IMAGE" ? (
                  <div className="space-y-3">
                    {b.url ? (
                      <div className="rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
                        <img src={b.url} alt="" className="w-full max-h-[380px] object-contain bg-white" />
                      </div>
                    ) : (
                      <div className="text-sm font-bold text-gray-400 border border-dashed border-gray-200 rounded-2xl p-6">
                        이미지가 없습니다. 상단 “+ 이미지”로 추가하세요.
                      </div>
                    )}
                    <div className="text-xs font-bold text-gray-400 break-all">
                      URL: <span className="text-gray-600">{b.url || "(없음)"}</span>
                    </div>
                  </div>
                ) : type === "VIDEO" ? (
                  <div className="space-y-3">
                    {b.url ? (
                      <div className="rounded-2xl overflow-hidden border border-gray-100 bg-black">
                        <video src={b.url} controls className="w-full max-h-[420px]" />
                      </div>
                    ) : (
                      <div className="text-sm font-bold text-gray-400 border border-dashed border-gray-200 rounded-2xl p-6">
                        영상이 없습니다. 상단 “+ 영상”로 추가하세요.
                      </div>
                    )}
                    <div className="text-xs font-bold text-gray-400 break-all">
                      URL: <span className="text-gray-600">{b.url || "(없음)"}</span>
                    </div>
                  </div>
                ) : type === "FILE" ? (
                  <div className="space-y-3">
                    {b.url ? (
                      <a
                        href={b.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-white hover:border-purple-200 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center font-black text-[#813eb6]">
                            FILE
                          </div>
                          <div>
                            <div className="text-sm font-black text-gray-800">첨부파일 열기</div>
                            <div className="text-xs font-bold text-gray-400 break-all">{b.url}</div>
                          </div>
                        </div>
                        <div className="text-xs font-black text-[#813eb6]">OPEN</div>
                      </a>
                    ) : (
                      <div className="text-sm font-bold text-gray-400 border border-dashed border-gray-200 rounded-2xl p-6">
                        파일이 없습니다. 상단 “+ 파일”로 추가하세요.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-xs font-black text-gray-400">URL</div>

                    <input
                      value={b.url ?? ""}
                      disabled={disabled}
                      onChange={(e) => patchBlock(idx, { url: e.target.value })}
                      onBlur={() => {
                        const fixed = normalizeExternalUrl(b.url ?? "");
                        if (fixed && fixed !== b.url) patchBlock(idx, { url: fixed });
                        if (type === "LINK" && fixed) void hydrateLinkMeta(idx);
                      }}
                      placeholder="https://..."
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-200"
                    />

                    <div className="text-xs font-bold text-gray-400">
                      임베드는 유튜브/지도 등 embed URL, 링크는 단순 링크용 (LINK는 입력 후 자동으로 썸네일/제목을 가져옵니다)
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {uploader.items.length > 0 && (
          <div className="mt-4 border border-gray-100 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 text-xs font-black text-gray-700">업로드 상태</div>
            <div className="p-3 space-y-2">
              {uploader.items.map((it) => (
                <div
                  key={it.id}
                  className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl border border-gray-100 bg-white"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-black text-gray-800 truncate">
                      {it.file.name} <span className="text-gray-400">({it.blockType})</span>
                    </div>
                    <div className="text-[11px] font-bold text-gray-400 truncate">
                      {it.status === "success" ? it.fileUrl : it.status === "error" ? it.error : "업로드중..."}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {it.status === "error" && (
                      <button
                        className="px-3 py-2 rounded-xl bg-purple-50 border border-purple-100 text-xs font-black text-[#813eb6]"
                        onClick={() => void uploader.retry(it.id)}
                      >
                        재시도
                      </button>
                    )}
                    <button
                      className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-black text-gray-600 hover:text-red-500"
                      onClick={() => uploader.remove(it.id)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
              {isUploading && <div className="text-xs font-bold text-gray-400 px-1">업로드 중에는 저장이 비활성화됩니다.</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
