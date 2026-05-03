import BikeFilter from '@/components/bike/BikeFilter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useBikes } from '@/hooks/useBike';
import { formatBikeType, formatPeso } from '@/lib/utils';
import { useBookingStore } from '@/stores/booking.store';
import { BikeFilters } from '@/types/bike.types'
import { AlertCircle, Minus, Plus } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom';

const DEFAULT_FILTERS: BikeFilters = {
    status: 'available',
    page: 1,
    limit: 9,
}

const Step1SelectBikes = () => {
    const [filters, setFilters] = useState<BikeFilters>(DEFAULT_FILTERS);
    const [searchParams, setSearchParams] = useSearchParams();
    const preSelectedId = searchParams.get('bikeId');

    const { data, isLoading } = useBikes(filters);
    const bikes = data?.data ?? [];

    const selectedBikes = useBookingStore((s) => s.selectedBikes);
    const addBike = useBookingStore((s) => s.addBike);
    const removeBike = useBookingStore((s) => s.removeBike);
    const setStep = useBookingStore((s) => s.setStep);
    const canProceed = useBookingStore((s) => s.canProceedStep1());

    const isSelected = useCallback((id: string) =>
        selectedBikes.some((b) => b._id === id), [selectedBikes]);

    const isMaxReached = selectedBikes.length >= 5;

    useEffect(() => {
        if (!preSelectedId) return;

        if (bikes.length === 0) return;

        if (selectedBikes.some((b) => b._id === preSelectedId)) {

            const newParams = new URLSearchParams(searchParams);
            newParams.delete('bikeId');
            setSearchParams(newParams, { replace: true});
            return;
        }

        const bike = bikes.find((b) => b._id === preSelectedId);
        if (!bike) {
            console.log('[Step1] Pre-selected bike not found or not available:', preSelectedId);
            return;
        }

        addBike(bike);
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('bikeId');
        setSearchParams(newParams, { replace: true});
       
    }, [preSelectedId, bikes]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className='space-y-6'>

            {/* selection summary */}
            {selectedBikes.length > 0 && (
                <div className="bg-[hsl(var(--primary)/0.08)] border border-[hsl(var(--primary)/0.2)] rounded-2xl p-4">
                    <p className="text-sm font-semibold text-[hsl(var(--primary))] mb-3">
                        Selected bikes ({selectedBikes.length}/5)
                    </p>
                    <div className='flex flex-wrap gap-2'>
                        {selectedBikes.map((bike) => (
                            <div key={bike._id} className='flex items-center gap-2 bg-white border border-[hsl(var(--primary)/0.3)] rounded-xl px-3 py-1.5 text-sm'>
                                <span>🚲</span>
                                <span className='font-medium text-[hsl(var(--foreground))]'>
                                    {bike.name}
                                </span>
                                <button onClick={() => removeBike(bike._id)} className="text-red-400 hover:text-red-600 transition-colors ml-1">
                                    <Minus size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* max warning */}
            {isMaxReached && (
                <div className='flex items-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3'>
                    <AlertCircle size={16} />
                    Maximum 5 bikes per reservation reached.
                </div>
            )}

            <div className='flex flex-col lg:flex-row gap-6'>
                {/* filteres */}

                <aside className="w-full lg:w-56 shrink-0">
                    <BikeFilter
                        filters={filters}
                        onChange={(f) => setFilters({ ...f, status: 'available' })}
                        onReset={() => setFilters(DEFAULT_FILTERS)}
                    />
                </aside>


                {/* BIKE GRID */}
                <div className='flex-1'>
                    {isLoading ? (
                        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="h-52 bg-[hsl(var(--muted))] rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    ) : bikes.length === 0 ? (
                        <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">
                            <div className="text-5xl mb-3">🚲</div>
                            <p className="font-semibold">No available bikes</p>
                            <p className='text-sm mt-1'>Try adjusting your filters</p>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 xl:grid-cols-2 gap-4">
                            {bikes.map((bike) => {
                                const selected = isSelected(bike._id);
                                return (
                                    <div key={bike._id} className={`bg-[hsl(var(--card))] rounded-2xl border-2 overflow-hidden transition-all ${selected ? 'border-[hsl(var(--primary))] shadow-md shadow-[hsl(var(--primary)/0.15)]'
                                        : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)]'}`}>

                                        {/* bike image */}
                                        <div className="h-32 bg-linear-to-br from-[hsl(var(--muted))] to-[hsl(138,30%,90%)] flex items-center justify-center relative">
                                            <span className='text-5xl opacity-50'>🚲</span>
                                            {selected && (
                                                <div className="absolute inset-0 bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
                                                    <div className='w-8 h-8 bg-[hsl(var(--primary))] rounded-full flex items-center justify-center text-white font-bold text-sm'>
                                                        ✓
                                                    </div>
                                                </div>
                                            )}
                                            <div className='absolute top-2 right-2'>
                                                <Badge variant='success'>Available</Badge>
                                            </div>
                                        </div>

                                        {/* bike info */}
                                        <div className="p-4">
                                            <p className="font-bold text-[hsl(var(--foreground))] text-sm mb-0.5">
                                                {bike.name}
                                            </p>
                                            <p className="text-xs text-[hsl(var(--muted-foreground))] mb-3">
                                                {formatBikeType(bike.category, bike.style)}
                                            </p>

                                            {/* price and button - responsive stack */}
                                            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                                                <div className='bg-[hsl(var(--primary)/0.1)] rounded-lg px-3 py-2 text-center sm:text-left'>
                                                    <span className='font-extrabold text-lg text-[hsl(var(--primary))]'>
                                                        {formatPeso(bike.ratePerHour)}/hr
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => selected ? removeBike(bike._id) : addBike(bike)}
                                                    disabled={!selected && isMaxReached}
                                                    className={`flex items-center justify-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 ${selected
                                                        ? 'bg-red-50 text-red-500 hover:bg-red-100 border border-red-200'
                                                        : 'bg-[hsl(var(--primary))] text-white hover:opacity-90'}`}
                                                    aria-label={selected ? `Remove ${bike.name} from selection` : `Add ${bike.name} to selection`}>
                                                    {selected
                                                        ? <><Minus size={12} /> Remove</>
                                                        : <><Plus size={12} /> Add</>}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* next button */}
            <div className='flex justify-end pt-4 border-t border-[hsl(var(--border))]'>
                <Button
                    onClick={() => setStep(2)}
                    disabled={!canProceed}
                    size='lg'>
                    Next - Choose slot →
                </Button>
            </div>

        </div>
    )
}

export default Step1SelectBikes
