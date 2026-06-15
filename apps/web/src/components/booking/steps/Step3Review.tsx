import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePayment } from '@/hooks/usePayment';
import { useCreateReservation } from '@/hooks/useReservation';
import { formatBikeType, formatDate, formatPeso } from '@/lib/utils';
import { useBookingStore } from '@/stores/booking.store';
import { AlertCircle, Bike, Calendar, Clock, FileText } from 'lucide-react';
import React, { useState } from 'react'

const Step3Review = () => {
    const [notes, setNotes] = useState('');
    const [apiError, setApiError] = useState('');

    const selectedBikes = useBookingStore((s) => s.selectedBikes);
    const slotHours = useBookingStore((s) => s.slotHours);
    const scheduledStart = useBookingStore((s) => s.scheduledStart);
    const totalCost = useBookingStore((s) => s.totalCost());
    const setStep = useBookingStore((s) => s.setStep);
    const setNoteStore = useBookingStore((s) => s.setNotes);
    const setReservation = useBookingStore((s) => s.setReservation);
    const isReservationCreated = useBookingStore((s) => s.isReservationCreated);
    const setReservationCreated = useBookingStore((s) => s.setReservationCreated);

    const { mutate: createReservation, isPending: isCreating } = useCreateReservation();
    const { mutate: initPayment, isPending: isPaying } = usePayment();

    const isPending = isCreating || isPaying;

    const handleConfirm = () => {
        if (isReservationCreated) return;

        setApiError('');
        setNoteStore(notes);

        // step 1: create reservatino
        createReservation(
            {
                bikeIds: selectedBikes.map((b) => b._id),
                slotHours: slotHours!,
                scheduledStart: new Date(scheduledStart).toISOString(),
                notes: notes || undefined,
            },
            {
                onSuccess: (reservation) => {
                    setReservationCreated(true);

                    //step 2 intialize paymetn dito
                    initPayment({
                        reservationId: reservation._id
                    }, {
                        onSuccess: (payment) => {
                            setReservation(reservation._id,
                                payment.clientKey,
                                payment.clientKey.split('_client_')[0]
                            );
                            setStep(4);
                        },
                        onError: (err: any) => {
                            setApiError(
                                err?.response?.data?.error?.message ??
                                'Payment initialization failed. Please try again.'
                            );
                        },
                    });
                },
                onError: (err: any) => {
                    setApiError(
                        err?.response?.data?.error?.message ??
                        'Failed to create reservation. Please try again.'
                    );
                },
            },
        );
    };
    return (
        <div className='space-y-6'>

            {/* api error */}
            {apiError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                    <AlertCircle size={16} />
                    {apiError}
                </div>
            )}

            {/* sleceted bikes */}
            <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Bike size={16} className='text-[hsl(var(--primary))]' />
                    <h3 className="font-bold text-[hsl(var(--foreground))]">
                        Selected bikes ({selectedBikes.length})
                    </h3>
                </div>
                <div className="space-y-2">

                    {selectedBikes.map((bike) => (
                        <div
                            key={bike._id}
                            className="flex items-center justify-between py-2 border-b border-[hsl(var(--border))] last:border-0">
                            <div className="flex items-center gap-3">
                                <span className="text-xl">🚲</span>
                                <div>
                                    <p className='text-sm font-semibold text-[hsl(var(--muted-foreground))]'>
                                        {bike.name} hello
                                    </p>
                                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                        {formatBikeType(bike.category, bike.style)} • #{bike.serialNumber}
                                    </p>
                                </div>
                            </div>
                            <Badge variant='success'>Available</Badge>
                        </div>
                    ))}
                </div>
            </div>


            {/* slot and schedule par */}
            <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock size={16} className="text-[hsl(var(--primary))]" />
                        <h4 className="font-bold text-sm text-[hsl(var(--foreground))]">Slot Durations</h4>
                    </div>
                    <p className="text-2xl font-extrabold text-[hsl(var(--primary))]">
                        {slotHours} Hour{slotHours! > 1 ? 's' : ''}
                    </p>
                </div>

                <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar size={16} className="text-[hsl(var(--primary))]" />
                        <h4 className="font-bold text-sm text-[hsl(var(--foreground))]">Schedule Start</h4>
                    </div>
                    <p className="text-sm font-bold text-[hsl(var(--foreground))]">
                        {scheduledStart ? formatDate(scheduledStart) : '—'}
                    </p>
                </div>
            </div>

            {/* notes */}
            <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-5">
                <div className='flex items-center gap-2 mb-3'>
                    <FileText size={16} className="text-[hsl(var(--primary))]" />
                    <h4 className="font-bold text-sm text-[hsl(var(--foreground))]">
                        Notes
                        <span className='text-[hsl(var(--muted-foreground))] font-normal'> (optional)</span>
                    </h4>
                </div>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder='Any special requests or notes for the operator...'
                    rows={3}
                    maxLength={500}
                    className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)] focus:border-[hsl(var(--border))] resize-none transition-all"
                />
                <p className='text-xs text-[hsl(var(--muted-foreground))] mt-1 text-right'>
                    {notes.length}/500
                </p>
            </div>

            {/* cost breaksdonw */}
            <div className="bg-[hsl(var(--primary)/0.06)] border border-[hsl(var(--primary)/0.2)] rounded-2xl p-5">
                <h4 className="font-bold text-[hsl(var(--foreground))] mb-4">Cost Breakdown</h4>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-[hsl(var(--muted-foreground))]">
                        <span>Rate per bike</span>
                        <span>₱150/hr</span>
                    </div>

                    <div className='flex justify-between text-[hsl(var(--muted-foreground))]'>
                        <span>Bikes × Hours</span>
                        <span>{selectedBikes.length} × {slotHours}hr</span>
                    </div>
                    <div className="border-t border-[hsl(var(--primary)/0.2)] pt-3 flex justify-between">
                        <span className="font-extrabold text-[hsl(var(--foreground))] text-base">Total</span>
                        <span className="font-extrabold text-[hsl(var(--primary))] text-xl">
                            {formatPeso(totalCost)}
                        </span>
                    </div>
                </div>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-3">
                    ⚠️ ₱50 overdue charge per 15 min past your slot per bike.
                    Overdue fees are settled at the counter.
                </p>
            </div>

            {/* navigation na dito */}
            <div className='flex flex-col sm:flex-row justify-between gap-3 pt-4 border-[hsl(var(--border))]'>
                <Button className="w-full sm:w-auto" variant='outline' onClick={() => setStep(2)} disabled={isPending || isReservationCreated}>
                    ← Back
                </Button>
                <Button
                    className="w-full sm:w-auto"
                    onClick={handleConfirm}
                    loading={isPending}
                    disabled={isReservationCreated}
                    size='lg'>
                    {
                        isPending ? 'Creating reservation...' : isReservationCreated  ? 'Proceeding to payment...' : 'Confirm and Proceed to Payment →'
                    }
                </Button>
            </div>
        </div>
    )
}

export default Step3Review
