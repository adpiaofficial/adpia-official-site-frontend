import httpClient from "./httpClient";

export type HistoryItem = {
  id: number;
  year: number;
  month: number;
  content: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type HistoryCreateRequest = {
  year: number;
  month: number;
  content: string;
  sortOrder: number;
};

export async function getHistories(decade?: number): Promise<HistoryItem[]> {
  const res = await httpClient.get<HistoryItem[]>("/history", { params: { decade } });
  return res.data;
}

export async function getHistoryDecades(): Promise<number[]> {
  const res = await httpClient.get<number[]>("/history/decades");
  return res.data;
}

export async function createHistory(req: HistoryCreateRequest): Promise<HistoryItem> {
  const res = await httpClient.post<HistoryItem>("/admin/history", req);
  return res.data;
}

export async function updateHistory(id: number, req: HistoryCreateRequest): Promise<HistoryItem> {
  const res = await httpClient.patch<HistoryItem>(`/admin/history/${id}`, req);
  return res.data;
}