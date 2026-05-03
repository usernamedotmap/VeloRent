import { ROUTES } from "@/constant/routes";
import { formatPeso } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";



type Status = 'processing' | 'success' | 'failed' | 'cancelled';

interface Props {
    status: Status;
    amount: number;
    reservationId: string | null;
    onRetry?: () => void;
    errorMessage?: string;
}


const STATUS_CONFIG = {
    processing: {
        emoji: '⏳',
        title: 'Processing Payment...',
        desc: 'Please wait while we confirm your payment.',
        color: 'text-amber-600',
        bg: 'bg-amber-50',
    },
    success: {
        emoji: '🎉',
        title: 'Payment Successful!',
        desc: 'Your booking is confirmed. See you at the park!',
        color: 'text-green-600',
        bg: 'bg-green-50',
    },
    failed: {
        emoji: '❌',
        title: 'Payment Failed',
        desc: 'Your payment could not be processed. Please try again.   ',
        color: 'text-red-600',
        bg: 'bg-red-50',
    },
    cancelled: {
        emoji: '↩️',
        title: 'Payment Cancelled',
        desc: 'You cancelled the payment. Your reservation is still pending.',
        color: 'text-[hsl(var(--muted-foreground))]',
        bg: 'bg-[hsl(var(--muted))]',
    },
}

export default function PaymentStatus(
    { status, amount, reservationId, onRetry, errorMessage }: Props
) {
    const config = STATUS_CONFIG[status];

    return (
        <div className="text-center space-y-6 py-8">

            {/* icon */}
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${config.bg} mx-auto`}>
                <span className="text-5xl">{config.emoji}</span>
            </div>

            {/* text */}
            <div>
                <h3 className={`text-xl font-extrabold mb-2 ${config.color}`}>
                    {config.title}
                </h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    {config.desc}
                </p>
                {errorMessage && (
                    <p className="text-sm text-red-500 mt-2 font-medium">
                        {errorMessage}
                    </p>
                )}
            </div>

            {/* amount */}
            {(status === 'success' || status === 'failed') && (
                <div className="bg-[hsl(var(--muted))] rounded-2xl p-4 inline-block">
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Amount</p>
                    <p className="text-2xl font-extrabold text-[hsl(var(--foreground))]">
                        {formatPeso(amount)}
                    </p>
                </div>
            )}

            {/* processing spinner */}
            {status == 'processing' && (
                <div className="flex justify-center">
                    <div className="w-8 h-8 border-2 border-[hsl(var(--border))] border-t-[hsl(var(--primary))] rounded-full animate-spin" />
                </div>
            )}

            {/* actions */}
            <div className="space-y-3">
                {status === 'success' && reservationId && (
                    <Link to={ROUTES.RESERVATION(reservationId)}>
                        <Button fullWidth size="lg">
                            View My Reservation →
                        </Button>
                    </Link>
                )}

                {(status === 'failed' || status === 'cancelled') && onRetry && (
                    <Button fullWidth size="lg" onClick={onRetry}>
                        Try Again
                    </Button>
                )}

                {status !== 'processing' && (
                    <Link to={ROUTES.DASHBOARD}>
                        <Button fullWidth variant="outline">
                            Go to Dashboard
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    );
}