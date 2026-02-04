import httpClient from "./httpClient";

export type PresignRequest = {
  boardCode: string;
  postId: number;
  contentType: string;
  originalFilename: string;
};

export type PresignResponse = {
  putUrl: string;
  key: string;
  fileUrl: string;
};

export async function presignFile(req: PresignRequest) {
  const res = await httpClient.post<PresignResponse>("/files/presign", req);
  return res.data;
}

export type DownloadPresignRequest = {
  key: string;
  contentType?: string;
  originalFilename?: string;
};

export type DownloadPresignResponse = {
  url: string;
};

export async function presignDownload(req: DownloadPresignRequest) {
  const res = await httpClient.post<DownloadPresignResponse>("/files/download-presign", req);
  return res.data;
}
