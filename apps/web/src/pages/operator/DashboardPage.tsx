

import ReservationCard from '@/components/reservation/ReservationCard';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constant/routes';
import { useReservations } from '@/hooks/useReservation'
import { Bike, Clock, Plus } from 'lucide-react';
import React from 'react'
import { Link } from 'react-router-dom';

const OperatorDashboard = () => {
    const { data: activeData } = useReservations({ status: 'active', limit: 5 });
    const { data: confirmedData } = useReservations({ status: 'confirmed', limit: 5 });

    const activeList = activeData?.data ?? [];
    const confirmedList = confirmedData?.data ?? [];
    return (
        <div className='space-y-8'>

            {/* header */}
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-2xl font-extrabold text-[hsl(var(--foreground))]'>
                        Operator Dashboard
                    </h1>
                    <p className='text-2xl font-extrabold text-[hsl(var(--foreground))]'>
                        {new Date().toLocaleDateString('en-PH', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </p>
                </div>
                <Link to={ROUTES.OPERATOR_WALKIN}>
                    <Button>
                        <Plus size={16} />
                        Walk-in
                    </Button>
                </Link>
            </div>

            {/* Quick staus */}
            <div className='grid grid-cols-2 gap-4'>
                <div className='bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-5'>
                    <div className='flex items-center gap-2 mb-2'>
                        <Bike size={16} className='text-green-600' />
                        <span className='text-sm font-semibold text-[hsl(var(--muted-foreground))]'>
                            Active Rides
                        </span>
                    </div>
                    <p className='text-3xl font-extrabold text-[hsl(var(--foreground))]'>
                        {activeList.length}
                    </p>
                </div>
                <div className='bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-5'>
                    <div className='flex items-center gap-2 mb-2'>
                        <Clock size={16} className='text-blue-600' />
                        <span className='text-sm font-semibold text-[hsl(var(--muted-foreground))]'>
                            Awaiting Start
                        </span>
                    </div>
                    <p className='text-3xl font-extrabold text-[hsl(var(--foreground))]'>
                        {confirmedList.length}
                    </p>
                </div>
            </div>

            {/* confirmed ready to start */}
            {confirmedList.length > 0 && (
                <div>
                    <div className='flex items-center justify-between mb-4'>
                        <h2 className='font-bold text-[hsl(var(--foreground))]'>
                            Ready to Start 🟢
                        </h2>
                        <Link to={ROUTES.OPERATOR_RIDES}>
                        <Button variant='ghost' size='sm'>View all →</Button>
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {confirmedList.map((r) =>   (
                            <ReservationCard key={r._id} reservation={r} showUser />
                        ))}
                    </div>
                </div>
            )}

            {/* active rieds */}
            {activeList.length > 0 && (
                <div>
                    <div className='flex items-center justify-between mb-4'>
                        <h2 className='font-bold text-[hsl(var(--foreground))]'>
                            Active Rides 🚴
                        </h2>
                        <Link to={ROUTES.OPERATOR_RIDES}>
                        <Button variant='ghost' size='sm'>View all →</Button>
                        </Link>
                    </div>
                    <div className='space-y-3'>
                        {activeList.map((r) => (
                            <ReservationCard key={r._id} reservation={r} showUser />
                        ))}
                    </div>
                </div>
            )}

            {activeList.length === 0 && confirmedList.length === 0 && ( 
                <div className='text-center py-16 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))]'>
                    <div className="text-5xl mb-3">🚲</div>
                    <p className='font-semibold text-[hsl(var(--foreground))]'>
                        No active rides right now
                    </p>
                    <p className='text-sm text-[hsl(var(--muted-foreground))] mt-1'>
                        Create a walk-in or wait for online bookings
                    </p>
                </div>
            ) }
        </div>
    )
}

export default OperatorDashboard
