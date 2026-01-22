import axios, { AxiosError } from "axios";

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
let pendingRequests: ((token: string | null) => void)[] = [];

httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      const headers = config.headers ?? {};
      config.headers = {
        ...headers,
        Authorization: `Bearer ${token}`,
      } as any;
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

    if (status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    // ✅ 밴 계정이면 refresh 금지 + 강제 로그아웃
    const data: any = error.response?.data;
    if (data?.code === "ACCOUNT_DISABLED") {
      localStorage.removeItem("accessToken");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    // refresh 요청 자체가 401이면 더 진행하지 않음
    if (originalRequest.url?.includes("/members/refresh")) {
      return Promise.reject(error);
    }

    // 이미 재시도한 요청이면 종료
    if (originalRequest._retry) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    // 이미 refresh 중이면 큐에 대기
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
      localStorage.setItem("accessToken", newToken);

      pendingRequests.forEach((cb) => cb(newToken));
      pendingRequests = [];
      isRefreshing = false;

      originalRequest.headers = {
        ...(originalRequest.headers ?? {}),
        Authorization: `Bearer ${newToken}`,
      };

      return httpClient(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem("accessToken");

      pendingRequests.forEach((cb) => cb(null));
      pendingRequests = [];
      isRefreshing = false;

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }

      return Promise.reject(refreshError);
    }
  }
);

export default httpClient;
