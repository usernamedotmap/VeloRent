// import { Button } from '@/components/ui/button';
// import { formatPeso } from '@/lib/utils';
// import { useBookingStore } from '@/stores/booking.store';
// import { ExternalLink } from 'lucide-react';
// import React, { useState } from 'react'
// import { useNavigate } from 'react-router-dom';

import PaymentModal from "@/components/payment/PaymentModal";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constant/routes";
import { useCancelReservation } from "@/hooks/useReservation";
import { api } from "@/lib/axios";
import { formatPeso } from "@/lib/utils";
import { useBookingStore } from "@/stores/booking.store";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";





export default function Step4Payment({ setIsIntentionallyLeaving }: { setIsIntentionallyLeaving: (val: boolean) => void }) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // booking store
    const clientKey = useBookingStore((s) => s.clientKey);
    const reservationId = useBookingStore((s) => s.reservationId);
    const totalCost = useBookingStore((s) => s.totalCost());
    const selectedBikes = useBookingStore((s) => s.selectedBikes);
    const slotHours = useBookingStore((s) => s.slotHours);
    const paymentStatus = useBookingStore((s) => s.paymentStatus)
    const setPaymentStatus = useBookingStore((s) => s.setPaymentStatus);
    const reset = useBookingStore((s) => s.reset);

    // local state dito
    const [showModal, setShowModal] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [backendStatus, setBackendStatus] = useState<string | null>(null);

    const { mutate: cancelReservation } = useCancelReservation(reservationId ?? '');

    const isAlreadyPaid = backendStatus === 'confirmed';
    const canCancel = backendStatus === 'pending' || backendStatus === null;
    const isPaymentLocked = ['initiated', 'processing', 'completed'].includes(paymentStatus);

    useEffect(() => {
        if (!reservationId) return;

        const checkStatus = async () => {
            try {
                const { data } = await api.get(`/reservation/${reservationId}`);
                const status = data.data?.status;
                setBackendStatus(status);

                if (status === 'confirmed') {
                    setPaymentStatus('completed');
                } else if (status === 'cancelled') {
                    setPaymentStatus('failed')
                }
            } catch { }
        };

        checkStatus();

        window.addEventListener('focus', checkStatus);
        return () => window.removeEventListener('focus', checkStatus);
    }, [reservationId]);


    const handleOpenPayment = () => {
        setPaymentStatus('initiated');
        setShowModal(true);
    };

    const handleSuccess = () => {
        setShowModal(false);
        queryClient.invalidateQueries({ queryKey: ['reservations'] });
        queryClient.invalidateQueries({ queryKey: ['payments'] });
        reset();

        if (reservationId) {
            navigate(ROUTES.RESERVATION(reservationId));
        } else {
            navigate(ROUTES.DASHBOARD);
        }
    };

    const handleCancelAndGoBack = () => {
        if (!reservationId) {
            reset();
            navigate(ROUTES.BIKES);
            return;
        }

        setIsCancelling(true);
        setIsIntentionallyLeaving(true);

        cancelReservation('Customer cancelled before payment',
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['reservations'] });
                    queryClient.invalidateQueries({ queryKey: ['bikes'] });
                    reset();
                    navigate(ROUTES.BIKES);
                },
                onError: () => {
                    // even tho na mag fail api - reset yan and go back
                    reset();
                    navigate(ROUTES.BIKES);
                },
                onSettled: () => {
                    setIsCancelling(false);
                    setIsIntentionallyLeaving(false);
                },
            }
        );
    }

    return (
        <>
            <div className="space-y-6">
                {isAlreadyPaid && (
                    <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-4 flex items-center gap-3">
                        <span className="text-2xl">🎉</span>
                        <div className="flex-1">
                            <p className="font-bold text-sm text-green-700">
                                Payment already completed!
                            </p>
                            <p className="text-xs text-green-600">
                                Your booking is confirmed.  See you at the park!
                            </p>
                        </div>
                        <Button
                            size="sm"
                            onClick={() => {
                                reset();
                                navigate(ROUTES.RESERVATION(reservationId!));
                            }}>
                            View Booking →
                        </Button>
                    </div>
                )}

                {/* payment in progres banner */}
                {paymentStatus === 'initiated' && !showModal && !isAlreadyPaid && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-3">
                        <span className="text-xl">⏳</span>
                        <div className="flex-1">
                            <p className="font-bold text-sm text-amber-700">
                                Payment in progress
                            </p>
                            <p className="text-xs text-amber-600">
                                Complete your payment in the other tab, or check status below.
                            </p>
                        </div>
                        <Button
                            size="sm"
                            onClick={() => {
                                setShowModal(true);
                                setPaymentStatus('processing');
                            }}>
                            Check Status
                        </Button>
                    </div>
                )}

                {/* order summary  */}
                <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] overflow-hidden">
                    <div className="bg-linear-to-br from-[hsl(var(--primary))] to-[hsl(142,76%,28%)] p-6 text-white text-center">
                        <div className="text-4xl mb-2">🚲</div>
                        <h3 className="text-xl font-extrabold mb-1">Ready to Ride!</h3>
                        <p className="text-white/80 text-sm">
                            Review your booking below and tap Pay Now to confirm
                        </p>
                    </div>

                    <div className="p-6 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-[hsl(var(--muted-foreground))]">Bikes</span>
                            <span className="font-semibold">
                                {selectedBikes.length} bike{selectedBikes.length > 1 ? 's' : ''}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-[hsl(var(--muted-foreground))]">Duration</span>
                            <span className="font-semibold">{slotHours}hr slot</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-[hsl(var(--muted-foreground))]">Rate</span>
                            <span className="font-semibold">₱150/hr per bike</span>
                        </div>
                        <div className="border-t border-[hsl(var(--border))] pt-3 flex justify-between">
                            <span className="font-extrabold text-[hsl(var(--foreground))]">
                                Total
                            </span>
                            <span className="font-extrabold text-[hsl(var(--primary))] text-2xl">
                                {formatPeso(totalCost)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* payment methods accepte d*/}
                <div>
                    <p className="text-xs text-center text-[hsl(var(--muted-foreground))] mb-3">
                        Accepted payment methods
                    </p>
                    <div className="flex justify-center gap-3">
                        {[
                            { emoji: '💙', label: 'GCash' },
                            { emoji: '💚', label: 'Maya' },
                            { emoji: '💳', label: 'Visa/MC' },
                        ].map(({ emoji, label }) => (
                            <div
                                key={label}
                                className="flex items-center gap-1.5 text-xs font-semibold bg-[hsl(var(--muted))] px-3 py-2 rounded-xl">
                                {emoji} {label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* security note */}
                <div className="flex items-center gap-3 bg-[hsl(var(--muted))] rounded-xl px-4 py-3 text-sm text-[hsl(var(--muted-foreground))]">
                    <span className="text-base shrink-0">🔒</span>
                    <p>
                        Your payment is processed securely by PayMongo.
                        VeloRent never stores you card details.
                    </p>
                </div>

                {/* navigation */}
                <div className="flex gap-3 pt-2 border border-[hsl(var(--border))]">
                    <Button variant="outline" onClick={() => setShowCancelConfirm(true)}>
                        ← Cancel
                    </Button>
                    <Button
                        fullWidth
                        size="lg"
                        disabled={!clientKey || !reservationId || isPaymentLocked}
                        onClick={handleOpenPayment}
                    >
                        {paymentStatus === 'initiated'
                            ? '⏳ Payment in progress...'
                            : paymentStatus === 'processing'
                                ? '🔄 Checking payment...'
                                : `💳 Pay ${formatPeso(totalCost)}`
                        }
                    </Button>
                </div>
            </div>

            {showCancelConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[hsl(var(--card))] rounded-3xl border border-[hsl(var(--border))] shadow-2xl w-full max-w-sm p-6 space-y-5">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-100 rounded-full mb-3">
                                <AlertTriangle size={24} className="text-amber-600" />
                            </div>
                            <h3 className="font-extrabold text-[hsl(var(--foreground))] text-lg mb-1">
                                Cancel Booking?
                            </h3>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                Your reservation wil be cancelled and your selected bikes will be released. You'll need to start over.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                fullWidth
                                onClick={() => setShowCancelConfirm(false)}
                                disabled={isCancelling}>
                                Keep Booking
                            </Button>
                            <Button
                                variant="danger"
                                fullWidth
                                loading={isCancelling}
                                onClick={handleCancelAndGoBack}
                            >
                                Yes, Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}



            {showModal && clientKey && reservationId && (
                <PaymentModal
                    clientKey={clientKey}
                    amount={totalCost}
                    reservationId={reservationId}
                    onClose={() => {
                        setShowModal(false);
                    }}
                    onSuccess={() => {
                        setPaymentStatus('completed');
                        handleSuccess();
                    }}
                    onFailed={() => {
                        setPaymentStatus('failed');
                        setShowModal(false);
                    }}
                />
            )}
        </>
    );
}
