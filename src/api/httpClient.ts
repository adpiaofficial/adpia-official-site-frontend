import axios, { AxiosError } from "axios";

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api",
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

// 응답 인터셉터: 401 이면 /members/refresh 로 자동 재발급 후 원래 요청 한 번만 재시도
httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;
    const status = error.response?.status;

    if (status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes("/members/refresh")) {
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
