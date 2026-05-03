import { ItemStatusBadge, PaymentStatusBadge, ReservationStatusBadge } from "@/components/common/StatusBadge";
import CancelModal from "@/components/reservation/CancelModal";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constant/routes";
import { useReservation } from "@/hooks/useReservation";
import { formatBikeType, formatDate, formatPeso } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Bike, Calendar, Clock, CreditCard, FileText, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";


const TIMELINE_STEPS = [
    { status: "pending", label: 'Booking Created', icon: '📝' },
    { status: 'confirmed', label: 'Payment Confirmed', icon: '✅' },
    { status: 'active', label: 'Ride Started', icon: '🚴' },
    { status: 'completed', label: 'Ride Completed', icon: '🏁' },
];

const STATUS_ORDER = ['pending', 'confirmed', 'active', 'completed'];

function StatusTimeline({ status }: { status: string }) {

    const currentIndex = STATUS_ORDER.indexOf(status);
    const isCancelled = status === 'cancelled';
    const isOverdue = status === 'overdue';


    if (isCancelled) {
        return (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
                <XCircle size={20} className="text-red-500" />
                <span className="text-sm font-semibold text-red-600">
                    This reservation was cancelled
                </span>
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="flex items-center justify-between relative">
                {/* background line */}
                <div className="absolute top-5 left-5 right-5 h-0.5 bg-[hsl(var(--border))]" />
                {/* progress line */}
                <div className="absolute top-5 left-5 h-0.5 bg-[hsl(var(--primary))] transition-all duration-700"
                    style={{
                        width: `${(Math.max(0, currentIndex) / (TIMELINE_STEPS.length - 1)) * (100 - 10)}%`
                    }} />

                {TIMELINE_STEPS.map(({ status: s, label, icon }, i) => {
                    const isDone = currentIndex > i || (isOverdue && i <= 2);
                    const isActive = currentIndex === i;

                    return (
                        <div key={s} className="flex flex-col items-center gap-2 relative z-10">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all ${isDone
                                ? 'bg-[hsl(var(--primary))] border-[hsl(var(--primary))]'
                                : isActive
                                    ? 'bg-[hsl(var(--card))] border-[hsl(var(--primary))] shadow-md'
                                    : 'bg-[hsl(var(--card))] border-[hsl(var(--border))]'}`}>
                                {icon}
                            </div>
                            <span className={`text-xs font-semibold text-center hidden sm:block ${isActive || isDone
                                ? 'text-[hsl(var(--primary))]'
                                : 'text-[hsl(var(--muted-foreground))]'}`}>
                                {label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function AdminReservationDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const paymentResult = searchParams.get('payment');
    const queryClient = useQueryClient();
    const [showCancel, setShowCancel] = useState(false);

    const user = useAuthStore((s) => s.user);

    const { data: reservation, isLoading, refetch } = useReservation(id!);


    // auth- refecth natin when return na ng payment
    useEffect(() => {
        if (paymentResult !== 'success') return;

        // pll every 2 seconsd
        const maxAttemps = 10;
        let attempts = 0;

        const interval = setInterval(async () => {
            attempts++;
            await refetch();

            const currentStatus = reservation?.status;

            if (currentStatus === 'confirmed' || attempts >= maxAttemps) {
                clearInterval(interval);
            }
        }, 2000);

        return () => clearInterval(interval)
    }, [paymentResult]);  // eslint-disable-line react-hooks/exhaustive-deps

    const payment = typeof reservation?.paymentId === 'object'
        ? reservation.paymentId as any : null;

    const canCancel = reservation &&
        ['pending', 'confirmed'].includes(reservation.status);

    if (isLoading) {
        return (
            <div className="space-y-4">
                {Array.from({ length }).map((_, i) => (
                    <div key={i} className="h-32 bg-[hsl(var(--muted))] rounded-2xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (!reservation) {
        return (
            <div className="text-center p-20">
                <p className="text-[hsl(var(--muted-foreground))]">Reservation not found</p>
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate(ROUTES.DASHBOARD)}>
                    Back to Dashboard
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto my-5">

            {paymentResult === 'success' && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
                    <span className="text-2xl">🎉</span>
                    <div>
                        <p className="font-bold">Payment successful!</p>
                        <p className="text-sm">Your booking is confirmed. See you at the park!</p>
                    </div>
                </div>
            )}

            {paymentResult === 'failed' && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-5 py-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
                    <span className="text-2xl">❌</span>
                    <div>
                        <p className="font-bold">Payment failed</p>
                        <p className="text-sm">Your payment could not be processed. Please try again.</p>
                    </div>
                </div>
            )}

            {/* back + header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(ROUTES.DASHBOARD)}
                    className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-xl font-extrabold text-[hsl(var(--foreground))]">
                        Reservation #{reservation._id.slice(-6).toUpperCase()}
                    </h1>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        {formatDate(reservation.createdAt)}
                    </p>
                </div>
                <div className="ml-auto">
                    <ReservationStatusBadge status={reservation.status} />
                </div>
            </div>

            {/* status timeline */}
            <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-6">
                <h3 className="font-bold text-[hsl(var(--foreground))] mb-6 text-sm">
                    Booking Progress
                </h3>
                <StatusTimeline status={reservation.status} />
            </div>

            {/* bikes */}
            <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Bike size={16} className="text-[hsl(var(--primary))]" />
                    <h3 className="font-bold text-[hsl(var(--foreground))]">
                        Bike ({reservation.items.length})
                    </h3>
                </div>
                <div className="space-y-3">
                    {reservation.items.map((item) => {
                        const bike = typeof item.bikeId === 'object' ? item.bikeId as any : null;
                        return (
                            <div
                                key={item._id}
                                className="flex items-center justify-between py-3 border-b border-[hsl(var(--border))] last:border-0">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">🚲</span>
                                    <div>
                                        <p className="font-semibold text-sm text-[hsl(var(--foreground))]">
                                            {bike?.name ?? 'Bike'}
                                        </p>
                                        {bike && (
                                            <p className="font-semibold text-sm text-[hsl(var(--foreground))]">
                                                {formatBikeType(bike.category, bike.style)} • #{bike.serialNumber}
                                            </p>
                                        )}
                                        {item.actualStart && (
                                            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                                                Started: {formatDate(item.actualStart)}
                                            </p>
                                        )}
                                        {item.actualEnd && (
                                            <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                                Returned: {formatDate(item.actualEnd)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <ItemStatusBadge status={item.status} />
                                    {item.overdueCost > 0 && (
                                        <p className="text-xs text-red-500 mt-1 font-semibold">
                                            +{formatPeso(item.overdueCost)} overdue
                                        </p>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* booking details */}
            <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--primary))] p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Clock size={14} className="text-[hsl(var(--primary))]" />
                        <h4 className="font-bold text-sm">Slot Duration</h4>
                    </div>
                    <p className="text-2xl font-extrabold text-[hsl(var(--primary))]">
                        {reservation.slotHours}hr
                    </p>
                </div>
                <div className="bg-[hsl(var(--card))] ronded-2xl border border-[hsl(var(--border))] p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Calendar size={14} className="text-[hsl(var(--primary))]" />
                        <h4 className="font-bold text-sm">Scheduled Start</h4>
                    </div>
                    <p className="text-sm font-bold">
                        {formatDate(reservation.scheduledStart)}
                    </p>
                </div>
            </div>

            {/* payment */}
            {payment && (
                <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <CreditCard size={16} className="text-[hsl(var(--primary))]" />
                        <h3 className="font-bold text-[hsl(var(--foreground))]">Payment</h3>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                {payment.provider === 'paymongo' ? 'Online Payment' : 'Cash'}
                            </p>
                            <p className="font-extrabold text-xl text-[hsl(var(--foreground))] mt-1">
                                {formatPeso(payment.amount)}
                            </p>
                        </div>
                        <PaymentStatusBadge status={payment.status} />
                    </div>
                </div>
            )}

            {/* cost breakdown */}
            <div className="bg-[hsl(var(--primary)/0.06)] border border-[hsl(var(--primary))] rounded-2xl p-6">
                <h3 className="font-bold text-[hsl(var(--foreground))] mb-4">
                    Cost Breakdown
                </h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-[hsl(var(--muted-foreground))]">
                        <span>Base cost</span>
                        <span>{formatPeso(reservation.baseCost)}</span>
                    </div>
                    {reservation.totalCost > reservation.baseCost && (
                        <div className="flex justify-between text-red-500">
                            <span>Overdue charges</span>
                            <span>{formatPeso(reservation.totalCost - reservation.baseCost)}</span>
                        </div>
                    )}
                    <div className="border-t border-[hsl(var(--primary)/0.2)] pt-2 flex justify-between font-extrabold">
                        <span>Total</span>
                        <span className="text-[hsl(var(--primary))] text-lg">
                            {formatPeso(reservation.totalCost)}
                        </span>
                    </div>
                </div>
            </div>

            {/* notes */}
            {reservation.notes && (
                <div className="bg-[hsl(var(--card))] rouded-2xl border border-[hsl(var(--border))] p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <FileText size={14} className="text-[hsl(var(--primary))]" />
                        <h4 className="font-bold text-sm">NOtes</h4>
                    </div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        {reservation.notes}
                    </p>
                </div>
            )}

           

           
          
        </div>
    );
}