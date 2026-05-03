import PageHeader from "@/components/common/PageHeader";
import Pagination from "@/components/common/Pagination";
import ReservationCard from "@/components/reservation/ReservationCard";
import { useReservations } from "@/hooks/useReservation";
import { ReservationStatus } from "@/types/reservation.types";
import { useState } from "react";



const STATUS_TABS: { value: ReservationStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'active', label: 'Active' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
];

const AdminReservationPage = () => {
    const [status, setStatus] = useState<ReservationStatus | 'all'>('all');
    const [page, setPage] = useState(1);

    const {data, isLoading} = useReservations({
        status: status !== 'all' ? status : undefined,
        page,
        limit: 10,
    });

    const reservations = data?.data ?? [];
    const pagination = data?.meta;

    return (
        <div className="p-8 space-y-6">
            <PageHeader  
            title="All Reservation" 
            description="View and manage all customer reservations"
            />

            {/* status tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {STATUS_TABS.map(({value, label}) => (
                    <button
                    key={value}
                    onClick={() => { setStatus(value); setPage(1)}}
                    className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                        status === value
                        ? 'bg-[hsl(var(--primary))] text-white'
                    : 'bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]'}`}>
                        {label}
                    </button>
                ))}
            </div>

            {/*  list */}
            {isLoading ? (
                <div className="space-y-3">
                    {Array.from({length}).map((_, i) => (
                        <div key={i} className="h-32 bg-[hsl(var(--muted))] rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : reservations.length === 0 ? (
                <div className="text-center py-16 bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
                    <p className="text-[hsl(var(--muted-foreground))]">No reservations found</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {reservations.map((r) => (
                        <ReservationCard key={r._id} reservation={r} showUser />
                    ))}
                </div>
            )}

                {pagination && (
                    <Pagination 
                    page={pagination.page}
                    totalPages={pagination.totalPages}
                    hasNext={pagination.hasNext}
                    hasPrev={pagination.hasPrev}
                    onNext={() => setPage((p) => p + 1)}
                    onPrev={() => setPage((p) => p - 1)}
                    onPage={setPage}
                    />
                )}
        </div>
    )

}

export default AdminReservationPage;