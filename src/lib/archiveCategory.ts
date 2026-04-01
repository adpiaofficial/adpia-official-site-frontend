import type { RecruitBoardCode } from "../api/recruitApi";

export type ArchiveCategory =
  | "competition-pt"
  | "social-project"
  | "ad-contest"
  | "ad-introduction"
  | "hundred-qna"
  | "three-minute-speech";

export const archiveCategoryMeta: Record<
  ArchiveCategory,
  {
    title: string;
    badge: string;
    boardCode: RecruitBoardCode;
    adminWriteOnly: boolean;
    commentEnabled: boolean;
  }
> = {
  "competition-pt": {
    title: "경쟁 PT",
    badge: "ARCHIVE",
    boardCode: "COMPETITION_PT",
    adminWriteOnly: false,
    commentEnabled: true,
  },
  "social-project": {
    title: "사회공헌프로젝트",
    badge: "ARCHIVE",
    boardCode: "SOCIAL_PROJECT",
    adminWriteOnly: false,
    commentEnabled: true,
  },
  "ad-contest": {
    title: "광고제",
    badge: "ARCHIVE",
    boardCode: "AD_CONTEST",
    adminWriteOnly: false,
    commentEnabled: true,
  },
  "ad-introduction": {
    title: "광고학개론",
    badge: "ARCHIVE",
    boardCode: "AD_INTRODUCTION",
    adminWriteOnly: false,
    commentEnabled: true,
  },
  "hundred-qna": {
    title: "백문백답",
    badge: "ARCHIVE",
    boardCode: "HUNDRED_QNA",
    adminWriteOnly: false,
    commentEnabled: true,
  },
  "three-minute-speech": {
    title: "3분 스피치",
    badge: "ARCHIVE",
    boardCode: "THREE_MIN_SPEECH",
    adminWriteOnly: false,
    commentEnabled: true,
  },
};

export function isArchiveCategory(v: string | undefined): v is ArchiveCategory {
  return (
    v === "competition-pt" ||
    v === "social-project" ||
    v === "ad-contest" ||
    v === "ad-introduction" ||
    v === "hundred-qna" ||
    v === "three-minute-speech"
  );
}