import { presignDownload } from "../api/fileApi";

export type DownloadMeta = {
  key?: string;
  contentType?: string;
  originalFilename?: string;
};

export async function downloadWithPresign(urlFallback: string | undefined, meta?: DownloadMeta) {
  const key = meta?.key;
  const filename = meta?.originalFilename || "download";

  // 1. key가 있는 경우: 백엔드를 거쳐 파일명을 주입받음
  if (key) {
    try {
      const { url } = await presignDownload({
        key,
        contentType: meta?.contentType,
        originalFilename: filename,
      });

      // a.download 속성 없이 이동해야 S3의 Content-Disposition이 우선 적용됨
      window.location.assign(url);
      return;
    } catch (error) {
      console.error("Presigned download failed:", error);
    }
  }

  // 2. key가 없는 경우: 직접 다운로드 시도 (이름은 브라우저에 제안만 가능)
  if (urlFallback) {
    const a = document.createElement("a");
    a.href = urlFallback;
    a.download = filename;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
}