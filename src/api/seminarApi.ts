import httpClient from "./httpClient";
import type { PageResponse, RecruitPost, RecruitPostUpsertRequest } from "./recruitApi";
import type { SeminarCategory } from "../lib/seminarCategory";

export async function getSeminarPosts(category: SeminarCategory, page = 0, size = 15) {
  const res = await httpClient.get<PageResponse<RecruitPost>>(`/seminar/${category}/posts`, {
    params: { page, size },
  });
  return res.data;
}

export async function getSeminarPost(category: SeminarCategory, id: number) {
  const res = await httpClient.get<RecruitPost>(`/seminar/${category}/posts/${id}`);
  return res.data;
}

export async function createSeminarPost(category: SeminarCategory, req: RecruitPostUpsertRequest) {
  const res = await httpClient.post<RecruitPost>(`/seminar/${category}/posts`, req);
  return res.data;
}

export async function updateSeminarPost(
  category: SeminarCategory,
  id: number,
  req: RecruitPostUpsertRequest
) {
  const res = await httpClient.patch<RecruitPost>(`/seminar/${category}/posts/${id}`, req);
  return res.data;
}

export async function deleteSeminarPost(category: SeminarCategory, id: number) {
  await httpClient.delete(`/seminar/${category}/posts/${id}`);
}

export async function updateSeminarPin(category: SeminarCategory, id: number, pinned: boolean) {
  await httpClient.patch(`/seminar/${category}/posts/${id}/pin`, { pinned });
}

export async function likeSeminarPost(category: SeminarCategory, id: number) {
  await httpClient.post(`/seminar/${category}/posts/${id}/like`);
}

export async function unlikeSeminarPost(category: SeminarCategory, id: number) {
  await httpClient.delete(`/seminar/${category}/posts/${id}/like`);
}