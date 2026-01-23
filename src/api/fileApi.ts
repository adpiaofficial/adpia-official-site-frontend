import httpClient from "./httpClient";

export type PresignRequest = {
  boardCode: "NOTICE" | "QA";
  postId: number;
  contentType: string;
  originalFilename: string;
};

export type PresignResponse = {
  putUrl: string;
  key: string;
  fileUrl: string; // DB에 저장할 최종 URL
};

export async function presignFile(req: PresignRequest) {
  const res = await httpClient.post<PresignResponse>("/files/presign", req);
  return res.data;
}
