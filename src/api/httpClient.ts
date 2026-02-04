import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
let pendingRequests: ((token: string | null) => void)[] = [];

function getAccessToken() {
  const t = localStorage.getItem("accessToken");
  if (!t || t === "null" || t === "undefined") return null;
  return t;
}

function setAccessToken(token: string | null) {
  if (!token) localStorage.removeItem("accessToken");
  else localStorage.setItem("accessToken", token);
}

httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    const url = config.url ?? "";

    if (token && !url.includes("/members/refresh")) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;
    const status = error.response?.status;

    if (!originalRequest || status !== 401) {
      return Promise.reject(error);
    }

    const data: any = error.response?.data;
    if (data?.code === "ACCOUNT_DISABLED") {
      setAccessToken(null);
      if (window.location.pathname !== "/login") window.location.href = "/login";
      return Promise.reject(error);
    }

    if ((originalRequest.url ?? "").includes("/members/refresh")) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push((newToken) => {
          if (!newToken) {
            reject(error);
            return;
          }
          originalRequest.headers = {
            ...(originalRequest.headers ?? {}),
            Authorization: `Bearer ${newToken}`,
          };
          resolve(httpClient(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshResponse = await httpClient.post("/members/refresh");
      const newToken = (refreshResponse.data as any).token as string;

      setAccessToken(newToken);

      pendingRequests.forEach((cb) => cb(newToken));
      pendingRequests = [];
      isRefreshing = false;

      originalRequest.headers = {
        ...(originalRequest.headers ?? {}),
        Authorization: `Bearer ${newToken}`,
      };

      return httpClient(originalRequest);
    } catch (refreshError) {
      setAccessToken(null);

      pendingRequests.forEach((cb) => cb(null));
      pendingRequests = [];
      isRefreshing = false;

      if (window.location.pathname !== "/login") window.location.href = "/login";

      return Promise.reject(refreshError);
    }
  }
);

export default httpClient;
