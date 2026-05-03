import ReservationCard from '@/components/reservation/ReservationCard';
import { useAdminStats } from '@/hooks/useAdmin';
import { useReservations } from '@/hooks/useReservation';
import { formatPeso } from '@/lib/utils';
import { Activity, AlertTriangle, Bike, CheckCircle, Clock, CreditCard, TrendingUp, Users } from 'lucide-react';
import React from 'react'

interface StatCardProps {
    icon: React.ElementType;
    label: string;
    value: string | number;
    sub?: string;
    color: string;
}

const StatCard = ({ icon: Icon, label, value, sub, color }: StatCardProps) => {
    return (
        <div className='bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-5'>
            <div className={`inline-flex p-2.5 rounded-xl mb-3 ${color}`}>
                <Icon size={18} />
            </div>
            <div className='text-2xl font-extrabold text-[hsl(var(--foreground))]'>
                {value}
            </div>
            <div className='text-sm text-[hsl(var(--muted-foreground))] mt-0.5'>
                {label}
            </div>
            {sub && (
                <div className='text-xs text-[hsl(var(--primary))] font-semibold mt-1'>
                    {sub}
                </div>
            )}
        </div>
    );
}



const AdminDashboard = () => {
    const { data: stats, isLoading: statsLoading } = useAdminStats();
    const { data: recentData } = useReservations({ limit: 5 });
    const recentReservation = recentData?.data ?? [];
    return (
        <div className='p-8 space-y-8'>

            {/* header */}
            <div>
                <h1 className='text-2xl font-extrabold text-[hsl(var(--foreground))]'>
                    Admin Dashboard
                </h1>
                <p className='text-sm text-[hsl(var(--muted-foreground))] mt-1'>
                    {new Date().toLocaleDateString('en-PH', {
                        weekday: 'long', year: 'numeric',
                        month: 'long', day: 'numeric',
                    })}
                </p>
            </div>

            {/* stats grid */}
            {statsLoading ? (
                <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                    {Array.from({ length }).map((_, i) =>
                        <div key={i} className='h-32 bg-[hsl(var(--muted))] rounded-2xl animate-pulse' />
                    )}
                </div>
            ) : stats ? (
                <>
                    {/* revenue her ah */}
                    <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                        <StatCard
                            icon={TrendingUp}
                            label="Today's Revenue"
                            value={formatPeso(stats.todayRevenue)}
                            color="text-green-600 bg-green-50"
                        />
                        <StatCard
                            icon={CreditCard}
                            label="Total Revenue"
                            value={formatPeso(stats.totalRevenue)}
                            color="text-emerald-600 bg-emerald-50"
                        />
                        <StatCard
                            icon={Clock}
                            label="Today's Booking"
                            value={stats.todayReservations}
                            color="text-blue-600 bg-50"
                        />
                        <StatCard
                            icon={AlertTriangle}
                            label="Pending Payments"
                            value={stats.pendingPayments}
                            color="text-amber-600 bg-amber-50"
                        />
                    </div>

                    {/* bikes +  users row */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            icon={Bike}
                            label="Available Bikes"
                            value={stats.availableBikes}
                            sub={`${stats.totalBikes} total`}
                            color="text-green-600 bg-green-50"
                        />
                        <StatCard
                            icon={Activity}
                            label="Active Rides"
                            value={stats.activeRides}
                            color="text-purple-600 bg-purple-50"
                        />
                        <StatCard
                            icon={CheckCircle}
                            label="In Maintenance"
                            value={stats.maintenanceBikes}
                            color="text-orange-600 bg-orange-50"
                        />
                        <StatCard
                            icon={Users}
                            label="Total Customers"
                            value={stats.totalUsers}
                            color="text-pink-600 bg-pink-50"
                        />
                    </div>
                </>
            ) : null}

            {/* fleet stats */}
            <div className='bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-6'>
                <h3 className='font-bold text-[hsl(var(--foreground))] mb-4'>
                    Fleet Status
                </h3>
                <div className='space-y-3'>
                    {[
                        { label: 'Available', value: stats?.availableBikes, color: 'bg-green-500', total: stats?.totalBikes },
                        { label: 'In Use', value: stats?.inUseBikes, color: 'bg-blue-500', total: stats?.totalBikes },
                        { label: 'Maintenance', value: stats?.maintenanceBikes, color: 'bg-amber-500', total: stats?.totalBikes }
                    ].map(({ label, value, color, total }) => (
                        <div key={label}>
                            <div className='flex justify-between text-sm mb-1'>
                                <span className='text-[hsl(var(--muted-foreground))]'>{label}</span>
                                <span className='font-semibold'>{value} / {total}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* rescent reservaions */}
            <div>
                <h3 className='font-bold text-[hsl(var(--foreground))] mb-3'>
                    Recent Reservations
                </h3>
                <div className='space-y-3'>
                    {recentReservation.map((r) => (
                        <ReservationCard key={r._id} reservation={r} showUser />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard;



