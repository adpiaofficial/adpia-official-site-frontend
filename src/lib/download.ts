import { presignDownload } from "../api/fileApi";

export type DownloadMeta = {
  key?: string;
  contentType?: string;
  originalFilename?: string;
};

export async function downloadWithPresign(urlFallback: string | undefined, meta?: DownloadMeta) {
  const key = meta?.key;
  if (!key) {
    if (!urlFallback) throw new Error("다운로드 URL이 없습니다.");
    const a = document.createElement("a");
    a.href = urlFallback;
    a.target = "_blank";
    a.rel = "noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();
    return;
  }

  const { url } = await presignDownload({
    key,
    contentType: meta?.contentType,
    originalFilename: meta?.originalFilename,
  });

  window.location.href = url;
}
