import React, { useRef, useState } from "react";
import useS3Upload from "../hooks/useS3Upload";
import type { RecruitBoardCode } from "../api/recruitApi";

type Props = {
  value: string | null;
  fallbackImg: string;
  onChange: (nextUrl: string | null) => void;

  // 임시(현재 useS3Upload 시그니처 때문에 필요)
  boardCode: RecruitBoardCode;
  postId: number;

  disabled?: boolean;
};

export default function ExecutiveImageUploader({
  value,
  fallbackImg,
  onChange,
  boardCode,
  postId,
  disabled,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const uploader = useS3Upload();
  const [uploading, setUploading] = useState(false);

  async function pickAndUpload(file: File) {
    if (!postId || postId <= 0) {
      alert("업로드용 postId가 없어요. (임시값 세팅 필요)");
      return;
    }
    setUploading(true);
    try {
      const result = await uploader.addAndUpload({ boardCode, postId, file });
      onChange(result.fileUrl);
    } catch (e) {
      console.error(e);
      alert("업로드 실패 (콘솔 확인)");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="w-[220px]">
      {/* 썸네일 */}
      <div className="w-[220px] h-[280px] rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
        <img
          src={value || fallbackImg}
          alt=""
          className={value ? "w-full h-full object-cover" : "w-20 opacity-90"}
        />
      </div>

      {/* 버튼 */}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
          className="flex-1 h-10 rounded-xl bg-[#813eb6] text-white font-bold hover:brightness-110 disabled:opacity-60"
        >
          {uploading ? "업로드 중..." : "이미지 선택"}
        </button>

        <button
          type="button"
          disabled={disabled || uploading || !value}
          onClick={() => onChange(null)}
          className="h-10 px-4 rounded-xl border border-gray-200 bg-white font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          제거
        </button>
      </div>

      {/* 파일 input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.currentTarget.value = "";
          if (!f) return;
          void pickAndUpload(f);
        }}
      />

      {/* ✅ URL은 숨김 (필요하면 아래 주석 해제)
      {value && (
        <div className="mt-2 text-[11px] text-gray-400 break-all">
          S3 URL: {value}
        </div>
      )}
      */}
    </div>
  );
}
