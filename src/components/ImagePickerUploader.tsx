import React, { useMemo, useRef, useState } from "react";
import { presignFile } from "../api/fileApi";

type Props = {
  boardCode: string;
  postId: number;

  /** 현재 저장된 S3 public URL (없으면 null) */
  value: string | null;

  /** value가 없을 때 보여줄 fallback 이미지 (로고 등) */
  fallbackImg: string;

  /** 업로드 완료 후 URL을 부모로 전달 */
  onChange: (url: string | null) => void;

  /** URL 텍스트를 보여줄지(기본 false: UI 깨짐 방지) */
  showUrl?: boolean;

  /** 미리보기 박스 크기 */
  size?: "sm" | "md";
};

function isImageType(type: string) {
  return type.startsWith("image/");
}

async function uploadToS3PutUrl(putUrl: string, file: File) {
  // presign이 PutObjectRequest에 contentType을 넣었으니, PUT에도 동일하게 넣는게 안전
  const res = await fetch(putUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
    body: file,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`S3 PUT failed: ${res.status} ${res.statusText} ${text}`);
  }
}

export default function ImagePickerUploader({
  boardCode,
  postId,
  value,
  fallbackImg,
  onChange,
  showUrl = false,
  size = "md",
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const box = useMemo(() => {
    if (size === "sm") return "w-28 h-28";
    return "w-40 h-40"; // md
  }, [size]);

  const previewSrc = value || fallbackImg;

  const pick = () => inputRef.current?.click();

  const clear = () => {
    if (uploading) return;
    onChange(null);
  };

  const onPickFile = async (file: File | null) => {
    if (!file) return;

    if (!isImageType(file.type)) {
      alert("이미지 파일만 업로드할 수 있어요.");
      return;
    }

    if (!boardCode || !postId) {
      alert("boardCode / postId 가 필요합니다.");
      return;
    }

    setUploading(true);
    try {
      // 1) presign 발급
      const presigned = await presignFile({
        boardCode,
        postId,
        contentType: file.type || "application/octet-stream",
        originalFilename: file.name || "image",
      });

      // 2) PUT 업로드
      await uploadToS3PutUrl(presigned.putUrl, file);

      // 3) public URL 반영
      onChange(presigned.fileUrl);
    } catch (e) {
      console.error(e);
      alert("업로드 실패. 콘솔을 확인해주세요.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* 미리보기 */}
      <div
        className={[
          box,
          "rounded-2xl overflow-hidden border border-gray-200 bg-gray-50",
          "flex items-center justify-center",
        ].join(" ")}
      >
        {previewSrc ? (
          <img
            src={previewSrc}
            alt=""
            className={value ? "w-full h-full object-cover" : "w-16 opacity-90"}
          />
        ) : (
          <div className="text-xs font-bold text-gray-400">NO IMAGE</div>
        )}
      </div>

      {/* 버튼 */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={pick}
          disabled={uploading}
          className="px-4 py-2 rounded-xl bg-[#813eb6] text-white font-black hover:brightness-110 disabled:opacity-60"
        >
          {uploading ? "업로드 중..." : "이미지 선택"}
        </button>

        <button
          type="button"
          onClick={clear}
          disabled={uploading}
          className="px-4 py-2 rounded-xl bg-white border border-gray-200 font-black text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          제거
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            void onPickFile(f);
            e.currentTarget.value = "";
          }}
        />
      </div>

      {/* ✅ URL은 기본 숨김 (UI 깨짐 방지) */}
      {showUrl && (
        <div className="text-xs text-gray-500">
          <div className="font-black text-gray-700 mb-1">S3 URL</div>
          <div className="max-w-[520px] rounded-xl border border-gray-200 bg-white px-3 py-2">
            {/* 길어도 UI 안 깨지게 */}
            <div className="break-all">
              {value ? value : <span className="text-gray-300">(없음)</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
