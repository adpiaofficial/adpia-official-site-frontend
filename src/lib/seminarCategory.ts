import type { RecruitBoardCode } from "../api/recruitApi";

export type SeminarCategory = "all" | "academic" | "operation";

export const seminarCategoryMeta: Record<
  SeminarCategory,
  {
    title: string;
    badge: string;
    boardCode: RecruitBoardCode;
    apiPath: string;
  }
> = {
  all: {
    title: "세미나",
    badge: "SEMINAR",
    boardCode: "SEMINAR",
    apiPath: "all",
  },
  academic: {
    title: "학술국",
    badge: "SEMINAR",
    boardCode: "SEMINAR",
    apiPath: "academic",
  },
  operation: {
    title: "운영팀",
    badge: "SEMINAR",
    boardCode: "SEMINAR",
    apiPath: "operation",
  },
};

export function isSeminarCategory(v: string | undefined): v is SeminarCategory {
  return v === "all" || v === "academic" || v === "operation";
}