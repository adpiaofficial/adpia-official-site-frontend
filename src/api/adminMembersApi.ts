import httpClient from "./httpClient";

export type MemberRole = "ROLE_USER" | "ROLE_PRESIDENT" | "ROLE_SUPER_ADMIN";
export type MemberGrade = "활동기수" | "OB" | "회장단" | "마스터";

export interface AdminMemberRow {
  id: number;
  name: string;
  email: string;
  generation: number;
  department: string;
  grade: string | null;
  role: MemberRole;
  active: boolean;
}

export async function getAdminMembers(): Promise<AdminMemberRow[]> {
  const res = await httpClient.get<AdminMemberRow[]>("/admin/members");
  return res.data;
}

export async function patchMemberGrade(id: number, grade: string): Promise<AdminMemberRow> {
  const res = await httpClient.patch<AdminMemberRow>(`/admin/members/${id}/grade`, { grade });
  return res.data;
}

export async function patchMemberActive(id: number, active: boolean): Promise<AdminMemberRow> {
  const res = await httpClient.patch<AdminMemberRow>(`/admin/members/${id}/active`, { active });
  return res.data;
}
