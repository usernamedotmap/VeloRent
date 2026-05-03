import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
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
    sessionBroadcaster.broadcast("logout");
  }
  window.location.href = "/login";
};

// respose interfaceptors
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<{ error: { code: string } }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // 1. checking
    const status = error.response?.status;
    const errorCode = error.response?.data?.error?.code;
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

    if (
      status === 401 && 
      (errorCode === 'INVALID_TOKEN') &&
      !isAuthRoute
    ) {
      await handleForceLogout();
    }

    return Promise.reject(error);
  
  },
);

// let isRefreshing = false;
// let failedQueue: {
//   resolve: (v: unknown) => void;
//   reject: (e: unknown) => void;
// }[] = [];

// // Max retries to prevent infinite loops
// const MAX_RETRY_ATTEMPTS = 1;

// const processQueue = (error: unknown) => {
//   failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(null)));
//   failedQueue = [];
// };

// // force logout here
// const forceLogout = async () => {
//   try {
//     // lazy import
//     const { useAuthStore } = await import('@/stores/auth.store');
//     const store = useAuthStore.getState();
//     store.logout();
//     // Broadcast logout to other tabs
//     sessionBroadcaster.broadcast('logout', { reason: 'token_invalid' });
//   } catch {
//     localStorage.removeItem('velorent-auth');
//     sessionBroadcaster.broadcast('logout', { reason: 'token_invalid' });
//   }
//   window.location.href = '/login';
// }

// // response intecenptos
// api.interceptors.response.use(
//   (res) => res,
//   async (error: AxiosError<{error: {code: string}}>) => {
//     const original = error.config as any;
//     const status = error.response?.status;
//     const code = error.response?.data?.error?.code;

//     // skip refresh for auth endpoints - to avoid infinite loop
//     const isAuthEndpoint = original?.url?.includes('/auth/');

//     // Prevent infinite retry loops by checking retry count
//     const retryCount = original?._retryCount ?? 0;
//     if (retryCount >= MAX_RETRY_ATTEMPTS) {
//       // Too many retries - force logout
//       console.log('[AUTH] Max retry attempts reached - logging out');
//       await forceLogout();
//       return Promise.reject(error);
//     }

//     // handle 401 - token expired or no token
//     if (
//       status === 401 &&
//       (code === 'TOKEN_EXPIRED' || code === 'NO_TOKEN' || code === 'NO_REFRESH_TOKEN') &&
//       !original._retry &&
//       !isAuthEndpoint
//     ) {
//       // if already refreshing = queue natin this req
//       if (isRefreshing) {
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject});
//         })
//         .then(() => {
//           // Increment retry count for queued requests
//           original._retryCount = retryCount + 1;
//           return api(original);
//         })
//         .catch((err) => Promise.reject(err));
//       }

//       original._retry = true;
//       original._retryCount = retryCount + 1;
//       isRefreshing = true;

//       try {
//         console.log('[AUTH] Token expired - attempting refresh...');
//         await api.post('/auth/refresh', {}, { withCredentials: true});
//         console.log('[AUTH] Token refreshed successfully');
//         // Broadcast token refresh to other tabs
//         sessionBroadcaster.broadcast('token-refreshed', { timestamp: Date.now() });
//         processQueue(null);
//         return api(original) // retry the original request
//       } catch (refreshError: any) {
//         console.log('[AUTH] Refresh failed - logging out');
//         sessionBroadcaster.broadcast('session-expired', { reason: 'refresh_failed' });
//         processQueue(refreshError);
//         await forceLogout();
//         return Promise.reject(refreshError);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     // Handle other 401 errors - redirect to login
//     if (status === 401 && !isAuthEndpoint) {
//       console.log('[AUTH] Unauthorized access - logging out');
//       await forceLogout();
//     }

//     return Promise.reject(error);
//   }
// )
