import { QUERY_KEYS } from "@/constant/queryKeyS";
import { api } from "@/lib/axios";
import { ACCESS_TOKEN_DURATION_MS, useAuthStore } from "@/stores/auth.store";
import { User } from "@/types/user.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { LoginInput, RegisterInput } from "@velorent/shared";
import { ROUTES } from "@/constant/routes";

// -- shared helpre --
export const recordTokenIssued = () => {
  useAuthStore.getState().setTokenExpiry(Date.now() + ACCESS_TOKEN_DURATION_MS);
};

// get current user
export const useMe = () => {
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: QUERY_KEYS.ME,
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: User }>(
        "/auth/me", 
      );
      setUser(data.data);
      return data.data;
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
    enabled: !!user,
  });
};

// LOGIN

export const useLogin = () => {
  const setUser = useAuthStore((s) => s.setUser);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: LoginInput & { redirectTo?: string }) => {
      // strip redirecTo before sending natin api
      const { redirectTo, ...loginData } = input;
      const { data } = await api.post<{ success: boolean; data: User }>(
        "/auth/login",
        loginData,
      );
      return { user: data.data, redirectTo };
    },
    onSuccess: ({ user, redirectTo }) => {
      setUser(user);
      recordTokenIssued();
      queryClient.setQueryData([QUERY_KEYS.ME], { data: user });

      if (redirectTo) {
        // go to intent destination
        navigate(redirectTo, { replace: true });
        return;
      }

      if (user.role === "admin") navigate(ROUTES.ADMIN);
      else if (user.role === "operator") navigate(ROUTES.OPERATOR);
      else navigate(ROUTES.DASHBOARD);
    },
  });
};

// REGISTER
export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      const { data } = await api.post<{ success: boolean; data: User }>("/auth/register", input);
      return data.data;
    },
    onSuccess: () => navigate(ROUTES.REGISTER),
  });
};

// logout
export const useLogout = () => {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{ success: boolean }>("/auth/logout");
      return data;
    },
    onSuccess: () => {
      logout();
      queryClient.clear();
      navigate(ROUTES.LOGIN);
    },
    onError: () => {
      logout();
      queryClient.clear();
      navigate(ROUTES.LOGIN);
    },
  });
};
