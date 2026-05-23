import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { sessionBroadcaster } from "./broadcastChannel";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- state for refresh logic ---
let isRefreshing = false;
let failedQueue: {
  resolve: (v: unknown) => void;
  reject: (e: unknown) => void;
}[] = [];

const processQueue = (error: unknown = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(null)));
  failedQueue = [];
};

// -- helper for forceLogut ha
const handleForceLogout = async () => {
  try {
    const { useAuthStore } = await import("@/stores/auth.store");
    useAuthStore.getState().logout();
  } catch {
    localStorage.removeItem("velorent-auth");
  }
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

// respose interfaceptors
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const data = error.response?.data as any;

    // 1. checking
    const status = error.response?.status;
    const errorCode = data?.error?.code;
    const isAuthRoute = originalRequest.url?.includes("/auth/");

    if (
      status === 401 &&
      errorCode === "TOKEN_EXPIRED" &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      // 2. handle mutltip requiest maybe for queuing
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // 3. start refresh process

      try {
        console.log("[AUTH] Silent refresh starting...");
        await api.post("/auth/refresh", {}, { withCredentials: true });

        // record new expiry
        const { recordTokenIssued } = await import("@/hooks/useAuth");
        recordTokenIssued();

        sessionBroadcaster.broadcast("token-refreshed");
        processQueue(null);

        console.log("[AUTH] Silent refresh succeeded ✅");
        return api(originalRequest);
      } catch (refreshError) {
        console.log("[AUTH] Silent refresh failed - logging out");
        processQueue(refreshError);
        sessionBroadcaster.broadcast("session-expired");
        await handleForceLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (status === 401 && errorCode === "INVALID_TOKEN" && !isAuthRoute) {
      await handleForceLogout();
    }

    return Promise.reject(error);
  },
);
