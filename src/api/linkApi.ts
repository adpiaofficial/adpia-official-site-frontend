import httpClient from "./httpClient";

export type LinkPreviewResponse = {
  url: string;
  siteName?: string | null;
  title?: string | null;
  desc?: string | null;
  image?: string | null;
};

export async function getLinkPreview(url: string) {
  const res = await httpClient.get<LinkPreviewResponse>("/link/preview", {
    params: { url },
  });
  return res.data;
}
