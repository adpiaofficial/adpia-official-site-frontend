import httpClient from "./httpClient";
import type { PageResponse, RecruitPost, RecruitPostUpsertRequest } from "./recruitApi";

export async function getHundredQnaPosts(page = 0, size = 15) {
  const res = await httpClient.get<PageResponse<RecruitPost>>("/hundred-qna/posts", {
    params: { page, size },
  });
  return res.data;
}

export async function getHundredQnaPost(id: number) {
  const res = await httpClient.get<RecruitPost>(`/hundred-qna/posts/${id}`);
  return res.data;
}

export async function createHundredQnaPost(req: RecruitPostUpsertRequest) {
  const res = await httpClient.post<RecruitPost>("/hundred-qna/posts", req);
  return res.data;
}

export async function updateHundredQnaPost(id: number, req: RecruitPostUpsertRequest) {
  const res = await httpClient.patch<RecruitPost>(`/hundred-qna/posts/${id}`, req);
  return res.data;
}

export async function deleteHundredQnaPost(id: number) {
  await httpClient.delete(`/hundred-qna/posts/${id}`);
}

export async function updateHundredQnaPin(id: number, pinned: boolean) {
  await httpClient.patch(`/hundred-qna/posts/${id}/pin`, { pinned });
}

export async function likeHundredQnaPost(id: number) {
  await httpClient.post(`/hundred-qna/posts/${id}/like`);
}

export async function unlikeHundredQnaPost(id: number) {
  await httpClient.delete(`/hundred-qna/posts/${id}/like`);
}

export type HundredQnaCommentStat = {
  memberId: number;
  memberName: string;
  department: string;
  generation: number;
  commentCount: number;
};

export async function getHundredQnaCommentStats() {
  const res = await httpClient.get<HundredQnaCommentStat[]>("/hundred-qna/comment-stats");
  return res.data;
}