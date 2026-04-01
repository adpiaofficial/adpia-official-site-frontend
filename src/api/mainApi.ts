import httpClient from "./httpClient";

export type MainActivityCard = {
  id: number;
  title: string;
  thumbnailUrl?: string | null;
  createdAt?: string | null;
};

export type MainActivityFeedResponse = {
  main: MainActivityCard | null;
  side: MainActivityCard[];
};

export async function getMainActivityFeed() {
  const res = await httpClient.get<MainActivityFeedResponse>("/main/activity-feed");
  return res.data;
}