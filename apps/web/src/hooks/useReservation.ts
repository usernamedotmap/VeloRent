import { QUERY_KEYS } from "@/constant/queryKeyS";
import { api } from "@/lib/axios";
import { Reservation, ReservationFilters } from "@/types/reservation.types";
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

// my resrvation (customer only here haha)
export const useMyReservation = (filters?: ReservationFilters) =>
  useQuery({
    queryKey: QUERY_KEYS.MY_RESERVATIONS(filters),
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Reservation>>(
        "/reservation/my",
        {
          params: filters,
        },
      );
      return data;
    },
  });

// all reservations
export const useReservations = (filters?: ReservationFilters) =>
  useQuery({
    queryKey: QUERY_KEYS.RESERVATIONS(filters),
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Reservation>>(
        "/reservation/all",
        {
          params: filters,
        },
      );
      return data;
    },
  });

// single resrvation
export const useReservation = (id: string) =>
  useQuery({
    queryKey: QUERY_KEYS.RESERVATION(id),
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: Reservation }>(
        `/reservation/${id}`,
      );
      return data.data;
    },
  });

// create resrvation (customer bai)
export const useCreateReservation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: unknown) => {
      const { data } = await api.post("/reservation/create/online", input);
      return data.data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["reservations"],
      }),
  });
};

// walk-in reservation (operator)
export const useCreateWalkIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: unknown) => {
      const { data } = await api.post("/reservation/create/walk-in", input);
      return data.data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["reservations"],
      }),
  });
};

// cancel resrvation
export const useCancelReservation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reason: string) => {
      const { data } = await api.patch(`/reservation/${id}/cancel`, {
        cancellationReason: reason,
      });
      return data.data;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({
        queryKey: ["reservations"],
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.RESERVATION(id),
      });
      queryClient.invalidateQueries({
        queryKey: ["bikes"],
      });
    },
  });
};

// --- start imte (operator) --
export const useStartItem = (reservationId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: string) => {
      const { data } = await api.patch(
        `/reservation/${reservationId}/start-item`,
        {
          itemId,
        },
      );
      return data.data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["reservations"],
      }),
  });
};

// -- compltet itme (operator) ----
export const useCompleteItem = (reservationId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (itemId) => {
      const { data } = await api.patch(
        `/reservation/${reservationId}/complete-item`,
        { itemId },
      );
      return data.data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["reservations"] }),
  });
};
