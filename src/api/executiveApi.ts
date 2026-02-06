// src/api/executiveApi.ts
import httpClient from "./httpClient";

export type AdminExecutiveMemberRequest = {
  id?: number;
  role: string;
  generation: string;
  department: string;
  name: string;
  imageUrl: string | null;
  orderIndex: number;
  active?: boolean | null;
};

export type ExecutiveGroup = {
  title: string;
  members: AdminExecutiveMemberRequest[];
};

// Public: List<ExecutiveGroupResponse>
export async function getExecutivesPublic(): Promise<ExecutiveGroup[]> {
  const res = await httpClient.get<ExecutiveGroup[]>("/executives");
  return res.data;
}

// Admin: List<ExecutiveGroupResponse>
export async function getExecutivesAdmin(): Promise<ExecutiveGroup[]> {
  const res = await httpClient.get<ExecutiveGroup[]>("/admin/executives");
  return res.data;
}

// Admin 저장: AdminExecutiveUpsertRequest { groupTitle, members }
export type AdminExecutiveUpsertRequest = {
  groupTitle: string;
  members: AdminExecutiveMemberRequest[];
};

export async function upsertExecutives(req: AdminExecutiveUpsertRequest): Promise<void> {
  await httpClient.put("/admin/executives", req);
}

export async function deleteExecutive(id: number): Promise<void> {
  await httpClient.delete(`/admin/executives/${id}`);
}
