import { Button } from '@/components/ui/button';
import { formatPeso } from '@/lib/utils';
import { useBookingStore } from '@/stores/booking.store'
import { Bike, Clock, ArrowRight } from 'lucide-react';
import React from 'react'

const LiveCostBar = () => {
    const selectedBikes = useBookingStore((s) => s.selectedBikes);
    const slotHours = useBookingStore((s) => s.slotHours);
    const totalCost = useBookingStore((s) => s.totalCost());
    const setStep = useBookingStore((s) => s.setStep);
    const canProceed = useBookingStore((s) => s.canProceedStep1());

    if (selectedBikes.length === 0) return null;
    return (
        <div className='sticky bottom-4 mx-4 z-40'>
            <div className="bg-[hsl(var(--primary))] text-white rounded-2xl px-6 py-4 shadow-xl shadow-[hsl(var(--primary)/0.3)] flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-sm flex-1 min-w-0">
                    {/* bikes */}
                    <div className='flex items-center gap-2'>
                        <Bike size={16} className='opacity-80' />
                        <span>
                            <strong>{selectedBikes.length}</strong>
                            bike{selectedBikes.length > 1 ? 's' : ''}
                        </span>
                    </div>

                    {/* divider here men */}
                    <div className='w-px h-4 bg-white/30 hidden sm:block' />

                    {/* slot hours dito */}
                    <div className='flex items-center gap-2'>
                        <Clock size={16} className='opacity-80' />
                        {slotHours
                            ? <span><strong>{slotHours}</strong> hr{slotHours > 1 ? 's' : ''}</span>
                            : <span className='opacity-70'>No slot</span>}
                    </div>
                </div>

                {/* total cost and button */}
                <div className='flex items-center gap-3'>
                    <div className='text-right'>
                        <div className='text-xs opacity-80'>Total</div>
                        <div className='text-lg font-extrabold'>
                            {totalCost > 0 ? formatPeso(totalCost) : '—'}
                        </div>
                    </div>
                    <Button
                        onClick={() => setStep(2)}
                        disabled={!canProceed}
                        size='sm'
                        className='bg-white text-[hsl(var(--primary))] hover:bg-white/90 font-semibold px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100'
                        aria-label="Proceed to choose slot">
                        Next <ArrowRight size={14} />
                    </Button>
                </div>
            </div>

        </div>
    )
}

export default LiveCostBar
