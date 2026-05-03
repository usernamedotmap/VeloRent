import { api } from "@/lib/axios";
import { ACCESS_TOKEN_DURATION_MS, useAuthStore } from "@/stores/auth.store";
import { useCallback, useEffect, useRef } from "react";
import { recordTokenIssued } from "./useAuth";
import { sessionBroadcaster } from "@/lib/broadcastChannel";

const REFRESH_BUFFER_MS = Math.min(ACCESS_TOKEN_DURATION_MS * 0.2, 60 * 1000);

export const useTokenRefresh = () => {
  const user = useAuthStore((s) => s.user);
  const tokenExpiresAt = useAuthStore((s) => s.tokenExpiresAt);
  const logout = useAuthStore((s) => s.logout);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const doRefresh = useCallback(async () => {
    try {
      console.log("[TOKEN] Proactive refresh firing...");
      await api.post("/auth/refresh", {}, { withCredentials: true });
      recordTokenIssued();
      sessionBroadcaster.broadcast("token-refreshed");
      console.log("[TOKEN] Proactive refresh succeeeded ✅");
    } catch {
      console.log("[TOKEN] Proactive refresh failed - logging out");
      logout();
      sessionBroadcaster.broadcast("session-expired");
      window.location.href = "/login";
    }
  }, [logout]);

  const scheduleRefresh = useCallback(() => {
    clearTimer();
    if (!tokenExpiresAt) return;

    const delay = tokenExpiresAt - Date.now() - REFRESH_BUFFER_MS;

    if (delay <= 0) {
      // expired na zero na nga eh
      console.log("[TOKEN] Token expired on load - refreshing immediately");
      doRefresh();
      return;
    }

    const delayMins = Math.round(delay / 1000 / 60);
    console.log(`[TOKEN] Proactive refresh scheduled in ~${delayMins} min`);
    timerRef.current = setTimeout(doRefresh, delay);
  }, [tokenExpiresAt, doRefresh, clearTimer]);

  useEffect(() => {
    if (!user) {
      clearTimer();
      return;
    }
    scheduleRefresh();
    return clearTimer;
  }, [user, tokenExpiresAt, scheduleRefresh, clearTimer]);

  useEffect(() => {
    const unsubRefreshed = sessionBroadcaster.on("token-refreshed", () => {
      // tab refresh the other tab imean
      scheduleRefresh();
    });

    const unsubLogout = sessionBroadcaster.on("logout", () => {
      clearTimer();
      logout();
      window.location.href = "/login";
    });

    const unsubExpired = sessionBroadcaster.on("session-expired", () => {
      clearTimer();
      logout();
      window.location.href = "/login";
    });

    return () => {
      unsubRefreshed();
      unsubLogout();
      unsubExpired();
    };
  }, [scheduleRefresh, clearTimer, logout]);
};
