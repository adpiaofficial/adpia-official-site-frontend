// src/api/popupApi.ts
import httpClient from "./httpClient";
import type { RecruitBlockRequest, RecruitBlockResponse } from "./recruitApi";

export type PopupDetailLinkType = "NONE" | "NOTICE" | "QA" | "PAGE" | "EXTERNAL";

export type PopupResponse = {
  id: number;
  title: string;
  active: boolean;
  startAt?: string | null;
  endAt?: string | null;

  blocks: RecruitBlockResponse[];

  detailLabel?: string | null;
  detailLinkType: PopupDetailLinkType;
  detailTargetId?: number | null;
  detailUrl?: string | null;

  createdAt: string;
  updatedAt: string;
};

export type PopupUpsertRequest = {
  title: string;
  active: boolean;
  startAt?: string | null;
  endAt?: string | null;

  blocks: RecruitBlockRequest[];

  detailLabel?: string | null;
  detailLinkType: PopupDetailLinkType;
  detailTargetId?: number | null;
  detailUrl?: string | null;
};

export async function getPopup(id: number): Promise<PopupResponse> {
  const res = await httpClient.get<PopupResponse>(`/popups/${id}`);
  return res.data;
}

export async function createPopup(body: PopupUpsertRequest): Promise<PopupResponse> {
  const res = await httpClient.post<PopupResponse>("/popups", body);
  return res.data;
}

export async function updatePopup(id: number, body: PopupUpsertRequest): Promise<PopupResponse> {
  const res = await httpClient.put<PopupResponse>(`/popups/${id}`, body);
  return res.data;
}

export async function deletePopup(id: number): Promise<void> {
  await httpClient.delete(`/popups/${id}`);
}

export async function getActivePopup(): Promise<PopupResponse | null> {
  const res = await httpClient.get<PopupResponse | null>("/popups/active");
  return res.data ?? null;
}

export async function getAdminPopup(): Promise<PopupResponse | null> {
  const res = await httpClient.get<PopupResponse | null>("/admin/popups/current");
  return res.data ?? null;
}

export async function saveAdminPopup(payload: PopupUpsertRequest): Promise<PopupResponse> {
  const res = await httpClient.put<PopupResponse>("/admin/popups/current", payload);
  return res.data;
}
