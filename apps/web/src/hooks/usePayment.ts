import { api } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface InitPaymentInput {
  reservationId: string;
}

interface InitPaymentResponse {
  clientKey: string;
  paymentId: string;
  amount: number;
}

export const useAdminPayments = (page: number) => {
    return useQuery({
        queryKey: ['admin', 'payments', page],
        queryFn: async () => {
            const {data} = await api.get('/admin/payments', {
                params:  {
                    page, 
                    limit: 15
                }
            })
            return data;
        }
    })
}


export const usePayment = () =>
  useMutation({
    mutationFn: async (input: InitPaymentInput) => {
      const { data } = await api.post<{
        success: boolean;
        data: InitPaymentResponse;
      }>("/payment/initialize", input);
      return data.data;
    },
  });



export const useRefundPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (paymentId: string) => {
      const { data } = await api.post(`/payment/refund/${paymentId}`);
      return data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "payments"] }),
  });
};


