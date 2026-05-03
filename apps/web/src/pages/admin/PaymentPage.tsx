import PageHeader from "@/components/common/PageHeader";
import Pagination from "@/components/common/Pagination";
import ResponsiveTable from "@/components/common/ResponsiveTable";
import { PaymentStatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { useAdminPayments, useRefundPayment } from "@/hooks/usePayment";
import { formatDate, formatPeso } from "@/lib/utils";
import { Payment } from "@/types/payment.types";
import {  useState } from "react";



// const useRefundPayment = () => {
//     const queryClient = useQueryClient();
//     return useMutation({
//         mutationFn: async (paymentId: string) => {
//             const { data } = await api.post(`/payment/refund/${paymentId}`);
//             return data;
//         },
//         onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] }),
//     });
// }


const AdminPaymentPage = () => {
    const [page, setPage] = useState(1);

    // const { data, isLoading } = useQuery({
    //     queryKey: ['admin', 'payments', page],
    //     queryFn: async () => {
    //         const { data } = await api.get('/admin/payments', {
    //             params: {
    //                 page,
    //                 limit: 15
    //             }
    //         });

    //         return data;
    //     }
    // });

    const { data, isLoading} = useAdminPayments(page);
    const { mutate: refund, isPending: isRefunding } = useRefundPayment();
    const [refundingId, setRefundingId] = useState<string | null>(null);

    const payments = data?.data ?? [];
    const pagination = data?.meta;

    return (
        <div className="p-8 space-y-6">
            <PageHeader
                title="Payments"
                description="All payments transactions"
            />

            <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] overflow-hidden">
                <ResponsiveTable
                    keyField="_id"
                    isLoading={isLoading}
                    data={payments}
                    emptyText="No payments found"
                    colums={[
                        {
                            key: 'createdAt',
                            label: 'Date',
                            render: (p: Payment) => (
                                <span className="text-[hsl(var(--muted-foreground))]">
                                    {formatDate(p.createdAt)}
                                </span>
                            )
                        },
                        {
                            key: 'reservationId',
                            label: 'Reservation ID',
                            render: (p: Payment) => (
                                <span className="font-mono text-xs uppercase text-[hsl(var(--muted-foreground))]">
                                    #{typeof p.reservationId === 'string' ? p.reservationId.slice(-6) : '—'}
                                </span>
                            ),
                            mobileHide: true,
                        },
                        {
                            key: 'provider',
                            label: 'Provider',
                            render: (p: Payment) => (
                                <span className="capitalize font-medium">
                                    {p.provider}
                                </span>
                            )
                        },
                        {
                            key: 'amount',
                            label: 'Amount',
                            render: (p: Payment) => (
                                <span className="font-bold tabular-nums">
                                    {formatPeso(p.amount)}
                                </span>
                            )
                        },
                        {
                            key: 'status',
                            label: 'Status',
                            render: (p: Payment) => <PaymentStatusBadge status={p.status} />
                        },
                        {
                            key: 'actiosn',
                            label: 'Actions',
                            render: (payment: Payment) => (
                                payment.status === 'paid' ? (
                                    <Button
                                        size="sm"
                                        variant="danger"
                                        loading={isRefunding && refundingId === payment._id}
                                        onClick={() => {
                                            if (confirm('Issue a full refund for this payment?')) {
                                                setRefundingId(payment._id);
                                                refund(payment._id, {
                                                    onSettled: () => setRefundingId(null),
                                                });
                                            }
                                        }}
                                    >
                                        Refund
                                    </Button>
                                ) : (
                                    <span className="text-xs text-[hsl(var(--muted-foreground))]">—</span>
                                )
                            )
                        }

                    ]}

                />
            </div>

            {
                pagination && (
                    <Pagination
                        page={pagination.page}
                        totalPages={pagination.totalPages}
                        hasNext={pagination.hasNext}
                        hasPrev={pagination.hasPrev}
                        onNext={() => setPage((p) => p + 1)}
                        onPrev={() => setPage((p) => p - 1)}
                        onPage={setPage}
                    />
                )
            }
        </div >
    )
}

export default AdminPaymentPage;