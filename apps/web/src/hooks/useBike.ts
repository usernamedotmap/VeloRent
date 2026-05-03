import { QUERY_KEYS } from "@/constant/queryKeyS";
import { api } from "@/lib/axios";
import { Bike, BikeFilters } from "@/types/bike.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// get all bikes
export const useBikes = (filters?: BikeFilters) => 
  useQuery({
    queryKey: QUERY_KEYS.BIKES(filters),
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Bike>>("/bike/all", {
        params: filters,
      });
      return data;
    },
    staleTime: 1000 * 60 * 2,
  });

// get single bike here noh
export const useBike = (id: string) => 
  useQuery({
    queryKey: QUERY_KEYS.BIKE(id),
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: Bike }>(
        `/bike/${id}`,
      );
      return data.data;
    },
    enabled: !!id,
  });


// creat enang bike
export const useCreateBike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: unknown) => {
      const { data } = await api.post("/bike/create", input);
      return data.data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["bikes"],
      }),
  });
};

// update bike bai admin
export const useUpdateBike = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: unknown) => {
      const { data } = await api.patch(`/bike/${id}/update`, input);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["bikes"],
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BIKE(id),
      });
    },
  });
};

// update bike status bai admin tas operator
export const useUPdateBikeStatus = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { status: string; note?: string }) => {
      const { data } = await api.patch(`/bike/${id}/status`, input);
      return data.data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["bikes"],
      }),
  });
};

// delete/retire bikes baid admin
export const useRetireBike = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/bike/${id}/delete`);
      return data.data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["bikes"],
      }),
  });
};
