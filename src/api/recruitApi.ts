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

export type RecruitBoardCode = "NOTICE" | "QA";

export type RecruitBlockType = "TEXT" | "FILE" | "IMAGE" | "VIDEO" | "EMBED" | "LINK";

export type RecruitBlockRequest = {
  type: RecruitBlockType;
  sortOrder: number;
  text?: string;
  url?: string;
  meta?: string; // json string
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
  title: string;

  authorMemberId?: number | null;
  authorType: "MEMBER" | "GUEST";
  authorName?: string | null;

  secret: boolean;
  pinned: boolean;
  commentEnabled: boolean;
  likeEnabled: boolean;
  viewCount: number;

  createdAt: string;
  updatedAt: string;

  blocks: RecruitBlockResponse[];

  /** ✅ secret 글인데 비번 없이 조회하면 서버가 locked=true로 내려주는 패턴 */
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

/** 목록 */
export async function getRecruitPosts(boardCode: RecruitBoardCode, page = 0, size = 10) {
  const res = await httpClient.get<PageResponse<RecruitPost>>(`/recruit/${boardCode}/posts`, {
    params: { page, size },
  });
  return res.data;
}

/** 상세 (secret 글 unlock 용 password query 지원) */
export async function getRecruitPost(id: number, password?: string) {
  const res = await httpClient.get<RecruitPost>(`/recruit/posts/${id}`, {
    params: password ? { password } : undefined,
  });
  return res.data;
}

/** 작성(draft) */
export async function createRecruitPost(boardCode: RecruitBoardCode, req: RecruitPostUpsertRequest) {
  const res = await httpClient.post<RecruitPost>(`/recruit/${boardCode}/posts`, req);
  return res.data;
}

/** 수정 */
export async function updateRecruitPost(id: number, req: RecruitPostUpsertRequest, password?: string) {
  const res = await httpClient.patch<RecruitPost>(`/recruit/posts/${id}`, req, {
    params: password ? { password } : undefined,
  });
  return res.data;
}

/** 삭제 */
export async function deleteRecruitPost(id: number, password?: string) {
  const res = await httpClient.delete(`/recruit/posts/${id}`, {
    params: password ? { password } : undefined,
  });
  return res.data;
}

/** 핀 토글 */
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

  children: RecruitComment[];
};

export type RecruitCommentCreateRequest = {
  parentId?: number | null;
  content: string;

  // 게스트 댓글
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
