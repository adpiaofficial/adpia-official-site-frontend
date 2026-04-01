import httpClient from "./httpClient";

/** Spring Page 응답 */
export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

export type RecruitBoardCode =
  | "NOTICE"
  | "QA"
  | "NEWS"
  | "HUNDRED_QNA"
  | "THREE_MIN_SPEECH"
  | "SEMINAR";

export type RecruitPostStatus = "DRAFT" | "PUBLISHED";

export type RecruitBlockType = "TEXT" | "FILE" | "IMAGE" | "VIDEO" | "EMBED" | "LINK";

export type RecruitBlockRequest = {
  type: RecruitBlockType;
  sortOrder: number;
  text?: string;
  url?: string;
  meta?: string;
};

export type RecruitBlockResponse = {
  type: RecruitBlockType;
  sortOrder: number;
  text?: string | null;
  url?: string | null;
  meta?: string | null;
};

export type RecruitPost = {
  id: number;
  boardCode: RecruitBoardCode;
  status?: RecruitPostStatus;
  title: string;

  authorMemberId?: number | null;
  authorType: "MEMBER" | "GUEST";
  authorName?: string | null;

  secret: boolean;
  pinned: boolean;
  commentEnabled: boolean;
  likeEnabled: boolean;
  viewCount: number;
  likedByMe?: boolean;
  likeCount?: number;

  createdAt: string;
  updatedAt: string;

  blocks: RecruitBlockResponse[];
  locked?: boolean;
};

export type RecruitPostUpsertRequest = {
  title: string;
  authorName?: string;
  secret?: boolean;
  password?: string;
  pinned?: boolean;
  commentEnabled?: boolean;
  likeEnabled?: boolean;
  blocks?: RecruitBlockRequest[];
};

export type RecruitDraftCreateRequest = {
  title?: string;
  authorName?: string;
  secret?: boolean;
  password?: string;
};

export async function getRecruitPosts(boardCode: RecruitBoardCode, page = 0, size = 10) {
  const res = await httpClient.get<PageResponse<RecruitPost>>(`/recruit/${boardCode}/posts`, {
    params: { page, size },
  });
  return res.data;
}

export async function getRecruitPost(id: number, password?: string) {
  const res = await httpClient.get<RecruitPost>(`/recruit/posts/${id}`, {
    params: password ? { password } : undefined,
  });
  return res.data;
}

export async function createRecruitDraft(boardCode: RecruitBoardCode, req: RecruitDraftCreateRequest) {
  const res = await httpClient.post<RecruitPost>(`/recruit/${boardCode}/draft`, req);
  return res.data;
}

export async function publishRecruitPost(id: number, req: RecruitPostUpsertRequest, password?: string) {
  const res = await httpClient.post<RecruitPost>(`/recruit/posts/${id}/publish`, req, {
    params: password ? { password } : undefined,
  });
  return res.data;
}

export async function updateRecruitPost(id: number, req: RecruitPostUpsertRequest, password?: string) {
  const res = await httpClient.patch<RecruitPost>(`/recruit/posts/${id}`, req, {
    params: password ? { password } : undefined,
  });
  return res.data;
}

export async function deleteRecruitPost(id: number, password?: string) {
  const res = await httpClient.delete(`/recruit/posts/${id}`, {
    params: password ? { password } : undefined,
  });
  return res.data;
}

export async function updateRecruitPostPin(id: number, pinned: boolean) {
  await httpClient.patch(`/recruit/posts/${id}/pin`, { pinned });
}

/* =======================
   댓글 / 대댓글
   ======================= */

export type RecruitComment = {
  id: number;
  postId: number;
  parentId: number | null;

  authorType: "MEMBER" | "GUEST";
  authorMemberId?: number | null;
  authorName?: string | null;

  content: string;
  deleted: boolean;

  createdAt: string;
  updatedAt?: string | null;

  likeCount?: number;
  likedByMe?: boolean;


  children: RecruitComment[];
};

export type RecruitCommentCreateRequest = {
  parentId?: number | null;
  content: string;
  authorName?: string;
  password?: string;
};

export async function getRecruitComments(postId: number) {
  const res = await httpClient.get<RecruitComment[]>(`/recruit/posts/${postId}/comments`);
  return res.data;
}

export async function createRecruitComment(postId: number, req: RecruitCommentCreateRequest) {
  const res = await httpClient.post<RecruitComment>(`/recruit/posts/${postId}/comments`, req);
  return res.data;
}

export async function deleteRecruitComment(commentId: number, password?: string) {
  const res = await httpClient.delete(`/recruit/comments/${commentId}`, {
    params: password ? { password } : undefined,
  });
  return res.data;
}

export async function likeRecruitComment(commentId: number) {
  await httpClient.post(`/recruit/comments/${commentId}/like`);
}

export async function unlikeRecruitComment(commentId: number) {
  await httpClient.delete(`/recruit/comments/${commentId}/like`);
}