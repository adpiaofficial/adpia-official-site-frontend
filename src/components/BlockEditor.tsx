// src/components/BlockEditor.tsx
import { useRef } from "react";
import type { RecruitBlockRequest, RecruitBlockType, RecruitBoardCode } from "../api/recruitApi";
import { normalizeSortOrder } from "../lib/blockUtils";
import useS3Upload, { type UploadBlockType } from "../hooks/useS3Upload";

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

function makeFileMeta(file: File) {
  return JSON.stringify({
    originalFilename: file.name,
    contentType: file.type,
    size: file.size,
  });
}

export default function BlockEditor({ boardCode, postId, value, onChange, disabled }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const fileAnyInputRef = useRef<HTMLInputElement | null>(null);

  const uploader = useS3Upload();
  const blocks = value;

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
    payload: { blockType: UploadBlockType; fileUrl: string; uploadId: string; file: File }
  ) => {
    const block: RecruitBlockRequest = {
      type: payload.blockType,
      sortOrder: 0,
      url: payload.fileUrl,
      meta: makeFileMeta(payload.file),
    };

    const next =
      insertAt == null
        ? [...blocks, block]
        : [...blocks.slice(0, insertAt), block, ...blocks.slice(insertAt)];

    onChange(normalizeSortOrder(next));
  };

  const onPickFiles = async (files: FileList | null, insertAt: number | null) => {
    if (!files || files.length === 0) return;

    const arr = Array.from(files);

    for (const file of arr) {
      const result = await uploader.addAndUpload({ boardCode, postId, file });

      insertUploadedBlock(insertAt, {
        blockType: result.blockType, // ✅ 여기서 통일
        fileUrl: result.fileUrl,
        uploadId: result.uploadId,
        file,
      });

      if (insertAt != null) insertAt += 1;
    }
  };

  const isUploading = uploader.isUploading;

  const actionBtnCls =
    "px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-black text-gray-600 hover:text-[#813eb6] hover:border-purple-200 transition-all disabled:opacity-50";

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
                  <textarea
                    value={b.text ?? ""}
                    disabled={disabled}
                    onChange={(e) => patchBlock(idx, { text: e.target.value })}
                    placeholder="텍스트 내용을 입력하세요"
                    className="w-full min-h-[140px] px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-200"
                  />
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
                        영상이 없습니다. 상단 “+ 영상”으로 추가하세요.
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
                      placeholder="https://..."
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-200"
                    />
                    <div className="text-xs font-bold text-gray-400">
                      임베드는 유튜브/지도 등 외부 embed URL 넣는 용도, 링크는 단순 링크용.
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
                <div key={it.id} className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl border border-gray-100 bg-white">
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
              {isUploading && (
                <div className="text-xs font-bold text-gray-400 px-1">업로드 중에는 저장이 비활성화됩니다.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
