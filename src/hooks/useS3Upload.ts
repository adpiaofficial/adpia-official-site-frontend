// src/hooks/useS3Upload.ts
import { useCallback, useMemo, useState } from "react";
import { presignFile } from "../api/fileApi";
import { uploadToS3Put } from "../lib/s3Uploader";
import type { RecruitBoardCode, RecruitBlockType } from "../api/recruitApi";

export type UploadStatus = "idle" | "uploading" | "success" | "error";

// ✅ 업로드로 만들어질 수 있는 블록 타입은 3개뿐
export type UploadBlockType = Extract<RecruitBlockType, "IMAGE" | "VIDEO" | "FILE">;

export type UploadItem = {
  id: string;
  file: File;
  boardCode: RecruitBoardCode;
  postId: number;

  blockType: UploadBlockType;
  status: UploadStatus;

  putUrl?: string;
  fileUrl?: string;
  error?: string;
};

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function guessMediaBlockType(file: File): UploadBlockType {
  if (file.type.startsWith("image/")) return "IMAGE";
  if (file.type.startsWith("video/")) return "VIDEO";
  return "FILE";
}

export default function useS3Upload() {
  const [items, setItems] = useState<UploadItem[]>([]);

  const isUploading = useMemo(
    () => items.some((it) => it.status === "uploading"),
    [items]
  );

  const addAndUpload = useCallback(
    async (params: { boardCode: RecruitBoardCode; postId: number; file: File }) => {
      const { boardCode, postId, file } = params;
      const id = uid();
      const blockType = guessMediaBlockType(file);

      const initial: UploadItem = {
        id,
        file,
        boardCode,
        postId,
        blockType,
        status: "uploading",
      };

      setItems((cur) => [initial, ...cur]);

      try {
        const presigned = await presignFile({
          boardCode,
          postId,
          contentType: file.type || "application/octet-stream",
          originalFilename: file.name,
        });

        await uploadToS3Put(presigned.putUrl, file);

        setItems((cur) =>
          cur.map((it) =>
            it.id === id
              ? {
                  ...it,
                  status: "success",
                  putUrl: presigned.putUrl,
                  fileUrl: presigned.fileUrl,
                  error: undefined,
                }
              : it
          )
        );

        return { uploadId: id, blockType, fileUrl: presigned.fileUrl };
      } catch (e: any) {
        setItems((cur) =>
          cur.map((it) =>
            it.id === id
              ? { ...it, status: "error", error: e?.message ?? "upload failed" }
              : it
          )
        );
        throw e;
      }
    },
    []
  );

  const retry = useCallback(
    async (uploadId: string) => {
      const target = items.find((x) => x.id === uploadId);
      if (!target) return;

      setItems((cur) =>
        cur.map((it) =>
          it.id === uploadId ? { ...it, status: "uploading", error: undefined } : it
        )
      );

      try {
        const presigned = await presignFile({
          boardCode: target.boardCode,
          postId: target.postId,
          contentType: target.file.type || "application/octet-stream",
          originalFilename: target.file.name,
        });

        await uploadToS3Put(presigned.putUrl, target.file);

        setItems((cur) =>
          cur.map((it) =>
            it.id === uploadId
              ? { ...it, status: "success", putUrl: presigned.putUrl, fileUrl: presigned.fileUrl }
              : it
          )
        );

        return { uploadId, blockType: target.blockType, fileUrl: presigned.fileUrl };
      } catch (e: any) {
        setItems((cur) =>
          cur.map((it) =>
            it.id === uploadId ? { ...it, status: "error", error: e?.message ?? "upload failed" } : it
          )
        );
        throw e;
      }
    },
    [items]
  );

  const remove = useCallback((uploadId: string) => {
    setItems((cur) => cur.filter((it) => it.id !== uploadId));
  }, []);

  const getById = useCallback((uploadId: string) => items.find((x) => x.id === uploadId), [items]);

  return {
    items,
    isUploading,
    addAndUpload,
    retry,
    remove,
    getById,
  };
}
