import httpClient from "./httpClient";
import type { PageResponse, RecruitPost, RecruitPostUpsertRequest } from "./recruitApi";

export async function getThreeMinuteSpeechPosts(page = 0, size = 15) {
  const res = await httpClient.get<PageResponse<RecruitPost>>("/three-minute-speech/posts", {
    params: { page, size },
  });
  return res.data;
}

export async function getThreeMinuteSpeechPost(id: number) {
  const res = await httpClient.get<RecruitPost>(`/three-minute-speech/posts/${id}`);
  return res.data;
}

export async function createThreeMinuteSpeechPost(req: RecruitPostUpsertRequest) {
  const res = await httpClient.post<RecruitPost>("/three-minute-speech/posts", req);
  return res.data;
}

export async function updateThreeMinuteSpeechPost(id: number, req: RecruitPostUpsertRequest) {
  const res = await httpClient.patch<RecruitPost>(`/three-minute-speech/posts/${id}`, req);
  return res.data;
}

export async function deleteThreeMinuteSpeechPost(id: number) {
  await httpClient.delete(`/three-minute-speech/posts/${id}`);
}

export async function updateThreeMinuteSpeechPin(id: number, pinned: boolean) {
  await httpClient.patch(`/three-minute-speech/posts/${id}/pin`, { pinned });
}

export async function likeThreeMinuteSpeechPost(id: number) {
  await httpClient.post(`/three-minute-speech/posts/${id}/like`);
}

export async function unlikeThreeMinuteSpeechPost(id: number) {
  await httpClient.delete(`/three-minute-speech/posts/${id}/like`);
}

export async function createThreeMinuteSpeechDraft(req: { title?: string } = {}) {
  const res = await httpClient.post<RecruitPost>("/recruit/THREE_MIN_SPEECH/draft", req);
  return res.data;
}

export async function publishThreeMinuteSpeechPost(id: number, req: any) {
  const res = await httpClient.post<RecruitPost>(`/recruit/posts/${id}/publish`, req);
  return res.data;
}