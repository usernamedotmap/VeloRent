import { useAuthStore } from "@/stores/auth.store";


export const updateTokenExpiry = () => {
    const ACCESS_TOKEN_MS = 15 * 60 * 1000;
    useAuthStore.getState().setTokenExpiry(Date.now() + ACCESS_TOKEN_MS);
}