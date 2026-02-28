import httpClient from "./httpClient";

export type RulesDoc = {
  id: number; 
  content: string;
  updatedAt: string;
  updatedBy: string | null;
};

export type RulesUpsertRequest = {
  content: string;
};

export async function getRules(): Promise<RulesDoc> {
  const res = await httpClient.get<RulesDoc>("/bylaw");
  return res.data;
}

export async function upsertRules(req: RulesUpsertRequest): Promise<RulesDoc> {
  const res = await httpClient.put<RulesDoc>("/admin/bylaw", req);
  return res.data;
}