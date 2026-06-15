
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ROUTES } from '@/constant/routes';
import { useBikes } from '@/hooks/useBike';
import { useCreateWalkIn } from '@/hooks/useReservation';
import { formatBikeType, formatPeso } from '@/lib/utils';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

const RATE = 15000;

const WalkInPage = () => {
    const navigate = useNavigate();

    const [selectedBikes, setSelectedBikes] = useState<string[]>([]);
    const [slotHours, setSlotHours] = useState<1 | 2 | 3>(1);
    const [customerId, setCustomerId] = useState('');
    const [notes, setNotes] = useState('');
    const [apiError, setApiError] = useState('');

    const { data } = useBikes({ status: 'available', limit: 50 });
    const availableBikes = data?.data ?? [];
    const { mutate, isPending } = useCreateWalkIn();

    const totalCost = selectedBikes.length * slotHours * RATE;

    const toggleBike = (id: string) => {
        setSelectedBikes((prev) =>
            prev.includes(id)
                ? prev.filter((b) => b !== id)
                : prev.length < 5 ? [...prev, id] : prev);
    };

    const handleSubmit = () => {
        if (selectedBikes.length === 0) return;
        setApiError('');

        mutate(
            {
                bikeIds: selectedBikes,
                slotHours,
                userId: customerId || undefined,
                notes: notes || undefined,
            },
            {
                onSuccess: (reservation) => navigate(ROUTES.OPERATOR_RIDES),
                onError: (err: any) => setApiError(
                    err?.response?.data?.error?.message ?? 'Failed to create walk-in'
                ),
            }
        );
    };

    return (
        <div className='max-w-5xl mx-auto space-y-6'>
            <h1 className='text-2xl font-extrabold text-[hsl(var(--foreground))]'>
                Create Walk-in Reservation
            </h1>

            {apiError && (
                <div className='bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl'>
                    {apiError}
                </div>
            )}

            {/* select bikes */}
            <div className='bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-6 '>
                <h3 className='font-bold text-[hsl(var(--foreground))] mb-4'>
                    Select Bikes ({selectedBikes.length}/5)
                </h3>
                {availableBikes.length === 0 ? (
                    <p className='text-sm text-[hsl(var(--muted-foreground))] text-center py-8'>
                        No available bikes at the moment
                    </p>
                ) : (
                    <div className='grid sm:grid-cols-2 gap-3'>
                        {availableBikes.map((bike) => {
                            const selected = selectedBikes.includes(bike._id);
                            return (
                                <button
                                    key={bike._id}
                                    onClick={() => toggleBike(bike._id)}
                                    className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${selected
                                        ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.06)]'
                                        : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)]'}`}>
                                    <span className='text-2xl'>🚲</span>
                                    <div className='flex-1'>
                                        <p className='font-semibold text-sm'>{bike.name}</p>
                                        <p className='text-xs text-[hsl(var(--muted-foreground))]'>
                                            {formatBikeType(bike.category, bike.style)}
                                        </p>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected
                                        ? 'bg-[hsl(var(--primary))] border-[hsl(var(--primary))] text-white'
                                        : 'border-[hsl(var(--border))]'}`}>
                                        {selected && <span className='text-xs'>✓</span>}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* slot + optional customer */}
            <div className='bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-6 space-y-5'>
                <h3 className='font-bold text-[hsl(var(--foreground))]'>
                    Booking Details
                </h3>

                {/* slot */}
                <div>
                    <p className='text-sm font-semibold text-[hsl(var(--foreground))] mb-3'>
                        Slot Duration
                    </p>
                    <div className='grid grid-cols-3 gap-3'>
                        {([1, 2, 3] as const).map((h) => (
                            <button
                                key={h}
                                onClick={() => setSlotHours(h)}
                                className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${slotHours === h
                                    ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.06)] text-[hsl(var(--primary))]'
                                    : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]'}`}>
                                {h}hr
                            </button>
                        ))}
                    </div>
                </div>

                {/* optional customer ID na dito*/}
                <Input
                    label='Customer User ID (optional)'
                    placeholder='Leave blank for anonymous walk-in'
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    hint='If customer has an account, enter their user ID'
                />

                {/* NOTES */}
                <div>
                    <label className='block text-sm font-semibold text-[hsl(var(--foreground))] mb-2'>
                        Notes (optional)
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder='Any notes...'
                        rows={2}
                        className='w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)] focus:border-[hsl(var(--primary))] resize-none transition-all'
                    />
                </div>
            </div>

            {/* cost + submitbutton na here beh */}
            <div className='bg-[hsl(var(--primary)/0.06)] border border-[hsl(var(--primary)/0.02)] rounded-2xl p-5'>
                    <div className='flex items-center justify-between mb-4'>
                        <span className='font-bold text-[hsl(var(--foreground))]'>Total</span>
                        <span className='font-extrabold text-[hsl(var(--primary))] text-2xl'>
                            {formatPeso(totalCost)}
                        </span>
                    </div>
                    <Button
                    fullWidth
                    size='lg'
                    loading={isPending}
                    disabled={selectedBikes.length === 0}
                    onClick={handleSubmit}>
                        Create Walk-in Reservation
                    </Button>
            </div>
        </div>
    )
}

export default WalkInPage
