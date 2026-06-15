

import { ItemStatusBadge, ReservationStatusBadge } from '@/components/common/StatusBadge';
import TimerDisplay from '@/components/common/TimerDisplay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useReservations } from '@/hooks/useReservation';
import { formatPeso } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, CheckCircle, Play } from 'lucide-react';
import React, { useState } from 'react'

const ActiveRidesPage = () => {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [actionError, setActionError] = useState('');

    const { data: activeData, isLoading: loadingActive } = useReservations({ status: 'active', limit: 50 });
    const { data: confirmedData, isLoading: loadingConfirmed } = useReservations({ status: 'confirmed', limit: 50 });
    const { data: overdueData } = useReservations({ status: 'overdue', limit: 50 });

    const allReservations = [
        ...(overdueData?.data ?? []),
        ...(activeData?.data ?? []),
        ...(confirmedData?.data ?? []),
    ];

    // filter by search (reservation ID)
    const filtered = search
        ? allReservations.filter((r) =>
            r._id.toLowerCase().includes(search.toLowerCase()) ||
            r._id.slice(-6).toLowerCase().includes(search.toLowerCase())
        ) : allReservations;

    const handleStarItem = (reservationId: string, itemId: string) => {
        setActionError('');
        //  using mutation directly
        const api = async () => {
            try {
                const { api: axiosApi } = await import('@/lib/axios');
                await axiosApi.patch(`/reservation/${reservationId}/start-item`, { itemId });
                queryClient.invalidateQueries({ queryKey: ['reservations'] });
            } catch (err: any) {
                setActionError(err?.response?.data?.error?.message ?? 'Failed to start item');
            }
        };
        api();
    };

    const handleCompleteItem = (reservationId: string, itemId: string) => {
        setActionError('');
        const api = async () => {
            try {
                const { api: axiosApi } = await import('@/lib/axios');
                await axiosApi.patch(`/reservation/${reservationId}/complete-item`, { itemId });
                queryClient.invalidateQueries({ queryKey: ['reservations'] });
            } catch (err: any) {
                setActionError(err?.response?.data?.error?.message ?? 'Failed to complete item');
            }
        };
        api();
    };

    return (
        <div className="space-y-6">

            {/* header */}
            <div className='flex items-center justify-between'>
                <h1 className='text-2xl font-extrabold text-[hsl(var(--foreground))]'>
                    Active Rides
                </h1>
                <div className='text-sm text-[hsl(var(--muted-foreground))]'>
                    {allReservations.length} reservation{allReservations.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* search by ID */}
            <Input
                placeholder='Search by reservation ID...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            {/* Error */}
            {actionError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                    <AlertTriangle size={14} />
                    {actionError}
                </div>
            )}

            {/* reservations */}
            {loadingActive || loadingConfirmed ? (
                <div className='space-y-4'>
                    {Array.from({ length }).map((_, i) => (
                        <div key={i} className='h-40 bg-[hsl(var(--muted))] rounded-2xl animate-pulse' />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className='text-center py-16 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))]'>
                    <div className='text-5xl mb-3'>🚲</div>
                    <p className='font-semibold text-[hsl(var(--foreground))]'>
                        No active rides
                    </p>
                </div>
            ) : (
                <div className='space-y-4'>
                    {filtered.map((reservation) => {
                        const isOverdue = reservation.status === 'overdue';
                        const user = typeof reservation.userId === 'object'
                            ? reservation.userId as any : null;

                        return (
                            <div
                                key={reservation._id}
                                className={`bg-[hsl(var(--card))] rounded-2xl border-2 p-5 ${isOverdue
                                    ? 'border-red-300 bg-red-50/50'
                                    : 'border-[hsl(var(--border))]'}`}>
                                {/* reservation header */}
                                <div className='flex items-center justify-between mb-4'>
                                    <div>
                                        <div className='flex items-center gap-2 mb-1'>
                                            <span className='font-bold text-sm text-[hsl(var(--foreground))]'>
                                                #{reservation._id.slice(-6).toUpperCase()}
                                            </span>
                                            <ReservationStatusBadge status={reservation.status} />
                                            {isOverdue && (
                                                <span className='flex items-center gap-1 text-xs text-red-500 font-bold'>
                                                    <AlertTriangle size={12} />
                                                    OVERDUE
                                                </span>
                                            )}
                                        </div>
                                        {user && (
                                            <p className='text-sm text-[hsl(var(--muted-foreground))]'>
                                                👤 {user.firstName} {user.lastName} • {user.phone}
                                            </p>
                                        )}
                                    </div>
                                    <div className='text-right text-sm'>
                                        <p className='font-bold text-[hsl(var(--foreground))]'>
                                            {formatPeso(reservation.totalCost)}
                                        </p>
                                        <p className='text-[hsl(var(--muted-foreground))]'>
                                            {reservation.slotHours}hr slot
                                        </p>
                                    </div>
                                </div>

                                {/* bike items */}
                                <div className='space-y-3'>
                                    {reservation.items.map((item) => {
                                        const bike = typeof item.bikeId === 'object'
                                            ? item.bikeId as any : null;
                                        const slotSeconds = reservation.slotHours * 3600;

                                        return (
                                            <div
                                                key={item._id}
                                                className={`flex flex-col sm:flex-row items-center gap-4 p-3 rounded-xl border ${item.status === 'overdue'
                                                    ? 'border-red-200 bg-red-50'
                                                    : item.status === 'active'
                                                        ? 'border-green-200 bg-green-50'
                                                        : 'border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.03)]'}`}>
                                                {/* bike info */}
                                                <div className='flex items-center gap-3 w-full sm:w-auto flex-1 min-w-0'>
                                                    <span className='text-xl shrink-0 select-none'>🚲</span>
                                                    <div className='flex-1 min-w-0'>
                                                        <p className='font-semibold text-sm truncate text-[hsl(var(--foreground))]'>
                                                            {bike?.name ?? 'Bike'}
                                                        </p>
                                                        {/* FIX: Left-aligned (justify-start) on mobile, 
              and centered (sm:justify-start or sm:justify-center) depending on desktop needs.
              We use justify-start here so badge and cost sit neatly next to each other.
            */}
                                                        <div className='flex items-center justify-start gap-2 mt-0.5'>
                                                            <ItemStatusBadge status={item.status} />
                                                            {item.overdueCost > 0 && (
                                                                <span className='text-xs text-red-500 font-bold shrink-0'>
                                                                    +{formatPeso(item.overdueCost)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>


                                                <div className='flex items-center gap-2 sm:shrink-0 mt-2 sm:mt-0'>
                                                    {/* timer (active items only ha) */}
                                                    {item.status === 'active' && item.actualStart && (
                                                        <div className='shrink-0'>
                                                            <TimerDisplay
                                                                startedAt={item.actualStart}
                                                                slotSeconds={slotSeconds}
                                                            // isOverdue={item.status === 'overdue'}
                                                            />
                                                        </div>
                                                    )}

                                                    {/* action button */}
                                                    <div className='shrink-0'>
                                                        {item.status === 'waiting' && (
                                                            <Button
                                                                size='sm'
                                                                onClick={() => handleStarItem(reservation._id, item._id)}>
                                                                <Play size={14} />
                                                                Start
                                                            </Button>
                                                        )}
                                                        {(item.status === 'active' || item.status === 'overdue') && (
                                                            <Button
                                                                size='sm'
                                                                variant={item.status === 'overdue' ? 'danger' : 'secondary'}
                                                                onClick={() => handleCompleteItem(reservation._id, item._id)}>
                                                                <CheckCircle size={14} />
                                                                Return
                                                            </Button>
                                                        )}
                                                        {item.status === 'completed' && (
                                                            <span className='text-xs text-[hsl(var(--muted-foreground))] font-semibold'>
                                                                ✓ Returned
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

        </div>
    );
}

export default ActiveRidesPage
