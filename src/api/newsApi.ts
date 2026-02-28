import httpClient from "./httpClient";
import type { PageResponse, RecruitPost } from "./recruitApi";

export async function getNewsPosts(page = 0, size = 15) {
  const res = await httpClient.get<PageResponse<RecruitPost>>("/news/posts", {
    params: { page, size },
  });
  return res.data;
}

export async function getNewsPost(id: number) {
  const res = await httpClient.get(`/news/posts/${id}`);
  return res.data;
}

export async function createNewsPost(req: any) {
  const res = await httpClient.post("/news/posts", req);
  return res.data;
}

export async function updateNewsPost(id: number, req: any) {
  const res = await httpClient.patch(`/news/posts/${id}`, req);
  return res.data;
}

export async function deleteNewsPost(id: number) {
  await httpClient.delete(`/news/posts/${id}`);
}

export async function updateNewsPin(id: number, pinned: boolean) {
  await httpClient.patch(`/news/posts/${id}/pin`, { pinned });
}