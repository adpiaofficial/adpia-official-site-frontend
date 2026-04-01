import httpClient from "./httpClient";
import type {
  PageResponse,
  RecruitPost,
  RecruitPostUpsertRequest,
  RecruitDraftCreateRequest,
} from "./recruitApi";
import type { CommunityCategory } from "../lib/communityCategory";

export async function getCommunityPosts(category: CommunityCategory, page = 0, size = 15) {
  const res = await httpClient.get<PageResponse<RecruitPost>>(`/community/${category}/posts`, {
    params: { page, size },
  });
  return res.data;
}

export async function getCommunityPost(category: CommunityCategory, id: number) {
  const res = await httpClient.get<RecruitPost>(`/community/${category}/posts/${id}`);
  return res.data;
}

export async function createCommunityDraft(
  category: CommunityCategory,
  req: RecruitDraftCreateRequest = {}
) {
  const res = await httpClient.post<RecruitPost>(`/recruit/${communityToBoardCodePath(category)}/draft`, req);
  return res.data;
}

export async function publishCommunityPost(
  id: number,
  req: RecruitPostUpsertRequest
) {
  const res = await httpClient.post<RecruitPost>(`/recruit/posts/${id}/publish`, req);
  return res.data;
}

export async function updateCommunityPost(
  category: CommunityCategory,
  id: number,
  req: RecruitPostUpsertRequest
) {
  const res = await httpClient.patch<RecruitPost>(`/community/${category}/posts/${id}`, req);
  return res.data;
}

export async function deleteCommunityPost(category: CommunityCategory, id: number) {
  await httpClient.delete(`/community/${category}/posts/${id}`);
}

export async function updateCommunityPin(category: CommunityCategory, id: number, pinned: boolean) {
  await httpClient.patch(`/community/${category}/posts/${id}/pin`, { pinned });
}

export async function likeCommunityPost(category: CommunityCategory, id: number) {
  await httpClient.post(`/community/${category}/posts/${id}/like`);
}

export async function unlikeCommunityPost(category: CommunityCategory, id: number) {
  await httpClient.delete(`/community/${category}/posts/${id}/like`);
}

function communityToBoardCodePath(category: CommunityCategory) {
  switch (category) {
    case "notice":
      return "COMMUNITY_NOTICE";
    case "adchance":
      return "AD_CHANCE";
    case "activity":
      return "ACTIVITY_PHOTO";
    case "ob":
      return "OB_BOARD";
  }
}