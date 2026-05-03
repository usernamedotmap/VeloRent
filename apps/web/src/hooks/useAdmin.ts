import { QUERY_KEYS } from "@/constant/queryKeyS";
import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface AdminStats {
  totalBikes: number;
  availableBikes: number;
  inUseBikes: number;
  maintenanceBikes: number;
  activeRides: number;
  todayRevenue: number;
  totalRevenue: number;
  pendingPayments: number;
  totalUsers: number;
  todayReservations: number;
}

export const useAdminStats = () =>
  useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const { data } = await api.get<{
        success: boolean;
        data: AdminStats;
      }>("/admin/stats");
      return data.data;
    },
    refetchInterval: 30000, // refresh every 30s
  });

// user list
export const useUsers = (filters?: Record<string, unknown>) =>
  useQuery({
    queryKey: QUERY_KEYS.USERS(filters),
    queryFn: async () => {
      const { data } = await api.get("/admin/users", {
        params: filters,
      });
      return data;
    },
  });


