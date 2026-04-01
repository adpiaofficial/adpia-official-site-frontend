import httpClient from "./httpClient";
import type {
  PageResponse,
  RecruitPost,
  RecruitPostUpsertRequest,
  RecruitDraftCreateRequest,
} from "./recruitApi";
import type { ArchiveCategory } from "../lib/archiveCategory";

export async function getArchivePosts(category: ArchiveCategory, page = 0, size = 15) {
  const res = await httpClient.get<PageResponse<RecruitPost>>(`/archive/${category}/posts`, {
    params: { page, size },
  });
  return res.data;
}

export async function getArchivePost(category: ArchiveCategory, id: number) {
  const res = await httpClient.get<RecruitPost>(`/archive/${category}/posts/${id}`);
  return res.data;
}

export async function createArchiveDraft(
  category: ArchiveCategory,
  req: RecruitDraftCreateRequest = {}
) {
  const res = await httpClient.post<RecruitPost>(
    `/recruit/${archiveToBoardCodePath(category)}/draft`,
    req
  );
  return res.data;
}

export async function publishArchivePost(id: number, req: RecruitPostUpsertRequest) {
  const res = await httpClient.post<RecruitPost>(`/recruit/posts/${id}/publish`, req);
  return res.data;
}

export async function createArchivePost(category: ArchiveCategory, req: RecruitPostUpsertRequest) {
  const res = await httpClient.post<RecruitPost>(`/archive/${category}/posts`, req);
  return res.data;
}

export async function updateArchivePost(
  category: ArchiveCategory,
  id: number,
  req: RecruitPostUpsertRequest
) {
  const res = await httpClient.patch<RecruitPost>(`/archive/${category}/posts/${id}`, req);
  return res.data;
}

export async function deleteArchivePost(category: ArchiveCategory, id: number) {
  await httpClient.delete(`/archive/${category}/posts/${id}`);
}

export async function updateArchivePin(category: ArchiveCategory, id: number, pinned: boolean) {
  await httpClient.patch(`/archive/${category}/posts/${id}/pin`, { pinned });
}

export async function likeArchivePost(category: ArchiveCategory, id: number) {
  await httpClient.post(`/archive/${category}/posts/${id}/like`);
}

export async function unlikeArchivePost(category: ArchiveCategory, id: number) {
  await httpClient.delete(`/archive/${category}/posts/${id}/like`);
}

function archiveToBoardCodePath(category: ArchiveCategory) {
  switch (category) {
    case "competition-pt":
      return "COMPETITION_PT";
    case "social-project":
      return "SOCIAL_PROJECT";
    case "ad-contest":
      return "AD_CONTEST";
    case "ad-introduction":
      return "AD_INTRODUCTION";
    case "hundred-qna":
      return "HUNDRED_QNA";
    case "three-minute-speech":
      return "THREE_MIN_SPEECH";
  }
}