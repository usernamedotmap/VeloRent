import { User } from "@/types/user.types";
import { persist } from "zustand/middleware";
import { create } from "zustand";
import { sessionBroadcaster } from "@/lib/broadcastChannel";

export const ACCESS_TOKEN_DURATION_MS = 15 * 60 * 1000;   
// 15 * 60 * 1000

interface AuthState {
  user: User | null;
  theme: "green" | "light" | "dark";
  tokenExpiresAt: number | null;

  setUser: (user: User | null) => void;
  setTheme: (theme: "green" | "light" | "dark") => void;
  setTokenExpiry: (expiresAt: number) => void;
  logout: () => void;
  initializeBroadcaster: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      theme: "green",
      tokenExpiresAt: null,

      setUser: (user) => set({ user }),

      setTheme: (theme) => {
        document.documentElement.setAttribute("data-theme", theme);
        set({ theme });
      },

      setTokenExpiry: (expiresAt) => set({ tokenExpiresAt: expiresAt }),

      logout: () => {
        set({ user: null, tokenExpiresAt: null });
        // broadcast is this tab is call from this own tab ha
        sessionBroadcaster.broadcast("logout");
      },

      initializeBroadcaster: () => {
        // for all  listerener
        sessionBroadcaster.on("logout", () => set({ user: null }));
        sessionBroadcaster.on("session-expired", () => set({ user: null }));
        sessionBroadcaster.on("user-updated", (user) => set({ user }));
      },
    }),
    {
      name: "velorent-auth",
      partialize: (s) => ({
        user: s.user,
        theme: s.theme,
        tokenExpiresAt: s.tokenExpiresAt,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          document.documentElement.setAttribute("data-theme", state.theme);
        }
      },
    },
  ),
);

// export const useAuthStore = create<AuthState>()(
//   persist(
//     (set) => {
//       // Store the logout function for use in the initializer
//       const logout = () => {
//         set({ user: null, tokenExpiresAt: null });
//         // Broadcast logout to other tabs
//         sessionBroadcaster.broadcast("logout", { timestamp: Date.now() });
//       };

//       return {
//         user: null,
//         theme: "green",
//         tokenExpiresAt: null,
//         setUser: (user) => set({ user }),
//         setTokenExpiry: (expiresAt) => set({ tokenExpiresAt: expiresAt }),
//         setTheme: (theme) => {
//           document.documentElement.setAttribute("data-theme", theme);
//           set({ theme });
//         },
//         logout,
//         initializeBroadcaster: () => {
//           // Listen for logout events from other tabs
//           sessionBroadcaster.on("logout", () => {
//             console.log("[Auth] Logout broadcasted from another tab");
//             set({ user: null });
//           });

//           // Listen for session expiry from other tabs
//           sessionBroadcaster.on("session-expired", () => {
//             console.log("[Auth] Session expired in another tab");
//             set({ user: null });
//           });

//           // Listen for user updates from other tabs
//           sessionBroadcaster.on("user-updated", (updatedUser: User) => {
//             console.log("[Auth] User updated in another tab");
//             set({ user: updatedUser });
//           });
//         },
//       };
//     },
//     {
//       name: "velorant-auth",
//       partialize: (state) => ({ user: state.user, theme: state.theme }),
//       onRehydrateStorage: () => (state) => {
//         // apply the theme on page load
//         if (state?.theme) {
//           document.documentElement.setAttribute("data-theme", state.theme);
//         }
//       },
//     },
//   ),
// );
