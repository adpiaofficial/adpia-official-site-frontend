import type { RecruitBoardCode } from "../api/recruitApi";

export type CommunityCategory = "notice" | "adchance" | "activity" | "ob";
export type CommunityViewType = "board" | "photo";

export const communityCategoryMeta: Record<
  CommunityCategory,
  {
    title: string;
    badge: string;
    boardCode: RecruitBoardCode;
    adminWriteOnly: boolean;
    commentEnabled: boolean;
    viewType: CommunityViewType;
  }
> = {
  notice: {
    title: "공지사항",
    badge: "COMMUNITY",
    boardCode: "COMMUNITY_NOTICE",
    adminWriteOnly: true,
    commentEnabled: false,
    viewType: "board",
  },
  adchance: {
    title: "애드찬스",
    badge: "COMMUNITY",
    boardCode: "AD_CHANCE",
    adminWriteOnly: true,
    commentEnabled: false,
    viewType: "board",
  },
  activity: {
    title: "활동 사진",
    badge: "COMMUNITY",
    boardCode: "ACTIVITY_PHOTO",
    adminWriteOnly: true,
    commentEnabled: true,
    viewType: "photo",
  },
  ob: {
    title: "OB 게시판",
    badge: "COMMUNITY",
    boardCode: "OB_BOARD",
    adminWriteOnly: false,
    commentEnabled: true,
    viewType: "board",
  },
};

export function isCommunityCategory(v: string | undefined): v is CommunityCategory {
  return v === "notice" || v === "adchance" || v === "activity" || v === "ob";
}