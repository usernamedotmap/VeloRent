import { ROUTES } from "@/constant/routes";
import { Reservation } from "@/types/reservation.types";
import { Link } from "react-router-dom";
import { ReservationStatusBadge } from "../common/StatusBadge";
import { formatDate, formatPeso } from "@/lib/utils";
import { Bike, Calendar, Clock } from "lucide-react";
import { useMe } from "@/hooks/useAuth";


interface Props {
    reservation: Reservation;
    showUser?: boolean;
}

export default function ReservationCard({ reservation, showUser }: Props) {
    const user = typeof reservation.userId === 'object' ? reservation.userId : null;
    const payment = typeof reservation.paymentId === 'object' ? reservation.paymentId : null;
    const { data } = useMe();
    if (!data) return;


    return (
        <Link
            to={data.role === 'admin' ? ROUTES.ADMIN_RESERVATION(reservation._id) : ROUTES.OPERATOR_RESERVATION(reservation._id)}
            className="block bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-5 hover:shadow-md hover:-translate-y-0.5 transition-all group">
            {/* header */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">
                        #{reservation._id.slice(-6).toUpperCase()}
                    </p>
                    <ReservationStatusBadge status={reservation.status} />
                </div>
                <div className="text-right">
                    <p className="font-extrabold text-[hsl(var(--primary))] text-lg">
                        {formatPeso(reservation.totalCost)}
                    </p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {reservation.channel === 'walk_in' ? '🚶 Walk-in' : '💻 Online'}
                    </p>
                </div>
            </div>

            {/* customer name (operator/admin) */}
            {showUser && user && (
                <div className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">
                    👤 {(user as any).firstName} {(user as any).lastName}
                </div>
            )}

            {/* details row */}
            <div className="flex flex-wrap gap-4 text-sm text-[hsl(var(--muted-foreground))]">
                <div className="flex items-center gap-1.5">
                    <Bike size={14} className="text-[hsl(var(--primary))]" />
                    <span>
                        {reservation.items.length} bike{reservation.items.length > 1 ? 's' : ''}
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-[hsl(var(--primary))]" />
                    <span>{reservation.slotHours}hr slot</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-[hsl(var(--primary))]" />
                    <span>{formatDate(reservation.scheduledStart)}</span>
                </div>
            </div>

            {/* view arrow */}
            <div className="mt-4 text-xs text-[hsl(var(--primary))] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                View details →
            </div>


        </Link>
    )

}