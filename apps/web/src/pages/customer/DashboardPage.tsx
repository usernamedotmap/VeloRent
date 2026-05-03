import ReservationCard from '@/components/reservation/ReservationCard';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constant/routes';
import { useMyReservation } from '@/hooks/useReservation';
import { formatPeso } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { ReservationStatus } from '@/types/reservation.types'
import { Bike, CheckCircle, Clock, Plus } from 'lucide-react';
import React, { useState } from 'react'
import { Link } from 'react-router-dom';


const STATUS_TABS: { value: ReservationStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];


export default function CustomerDashboard() {
  const user = useAuthStore((s) => s.user);
  const [status, setStatus] = useState<ReservationStatus | 'all'>('all');

  const { data, isLoading } = useMyReservation(
    status !== 'all' ? { status } : undefined
  );

  const reservations = data?.data ?? [];
  const pagination = data?.meta;

  // quick start in reservations
  const activeCount = reservations.filter((r) => r.status === 'active').length;
  const completedCount = reservations.filter((r) => r.status === 'completed').length;
  const totalSpent = reservations.filter((r) => r.status === 'completed').reduce((sum, r) => sum + r.totalCost, 0);

  return (
    <div className="space-y-8">

      {/* welcome header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[hsl(var(--foreground))]">
            Hey, {user?.firstName}! 👋
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1 text-sm">
            Manage your bike reservation here
          </p>
        </div>
        <Link to={ROUTES.RESERVATION_NEW}>
          <Button size='lg'>
            <Plus size={18} />
            Book a Bike
          </Button>
        </Link>
      </div>

      {/* quick stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            icon: Bike,
            label: 'Active Rides',
            value: activeCount,
            color: 'text-green-600 bg-green-50',
          },
          {
            icon: CheckCircle,
            label: 'Completed',
            value: completedCount,
            color: 'text-blue-600 bg-blue-50',
          },
          {
            icon: Clock,
            label: 'Total Spent',
            value: formatPeso(totalSpent),
            color: 'text-purple-600 bg-purple-50'
          }
        ].map(({ icon: Icon, label, value, color }) => (
          <div
            key={label}
            className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-5">
            <div className={`inline-flex p-2.5 rounded-xl mb-3 ${color}`}>
              <Icon size={18} />
            </div>
            <div className="text-xl font-extrabold text-[hsl(var(--foreground))]">
              {value}
            </div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* reservation lists */}
      <div>
        {/* stuats tabs */}
        <div className="flex gap-2 overflow-x-auto mb-6 scrollbar-hide p-2">
          {STATUS_TABS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setStatus(value)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-none transition-all ${status === value
                ? 'bg-[hsl(var(--primary))] text-white shadow-sm'
                : 'bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* list */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length }).map((_, i) => (
              <div key={i} className='h-32 bg-[hsl(var(--muted))] rounded-2xl animate-pulse' />
            ))}
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-16 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))]">
            <div className="text-5xl mb-3">🚲</div>
            <h3 className='font-bold text-[hsl(var(--foreground))] mb-2'>No reservations yet</h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">Book your first bike ride today!</p>
            <Link to={ROUTES.RESERVATION_NEW}>
              <Button>
                <Plus size={16} />
                Book a Bike
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <ReservationCard key={reservation._id} reservation={reservation} />
            ))}
          </div>
        )}

        {/* pagination infor */}
        {pagination && pagination.total > 0 && (
          <p className="text-center text-sm text-[hsl(var(--muted-foreground))] mt-6">
            Showing {reservations.length} of {pagination.total} reservations
          </p>
        )}

      </div>
    </div>
  )
}
