import { useAuthStore } from "@/stores/auth.store";

const IS_PROD = import.meta.env.VITE_NODE_ENV;

export const updateTokenExpiry = () => {
    const ACCESS_TOKEN_MS = IS_PROD === 'development' ? 30 : 15 * 60 * 1000;
    useAuthStore.getState().setTokenExpiry(Date.now() + ACCESS_TOKEN_MS);
}