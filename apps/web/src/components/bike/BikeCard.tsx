import { Bike } from "@/types/bike.types";
import { Badge } from "../ui/badge";
import { formatBikeType, formatPeso } from "@/lib/utils";
import { BikeIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constant/routes";
import { Button } from "../ui/button";


interface Props {
    bike: Bike;
}


const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
    available: 'success',
    reserved: 'warning',
    in_use: 'danger',
    maintenance: 'default',
    retired: 'default',
};

const statusLabel: Record<string, string> = {
    available: 'Available',
    reserved: 'Reserved',
    in_use: 'In Use',
    maintenance: 'Maintenance',
    retired: 'Retired',
};

export default function BikeCard({ bike }: Props) {
    const isAvailable = bike.status === 'available';

    return (
        <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all group">

            {/* image placeholder */}
            <div className="relative h-44 bg-linear-to-br from-[hsl(var(--muted))] to-[hsl(138, 30%, 90%)] flex items-center justify-center overflow-hidden">
                {bike.imageUrls.length > 0 ? (
                    <img
                        src={bike.imageUrls[0]}
                        alt={bike.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="text-6xl opacity-40 group-hover:scale-110 transition-transform duration-300">
                        🚲
                    </div>
                )}

                {/* status badge */}
                <div className="absolute top-3 right-3">
                    <Badge variant={statusVariant[bike.status]}>
                        {statusLabel[bike.status]}
                    </Badge>
                </div>

                {/* category badge */}
                <div className="absolute top-3 left-3">
                    <Badge variant="outline" className="bg-white/80 backdrop-blur-sm">
                        {formatBikeType(bike.category, bike.style)}
                    </Badge>
                </div>
            </div>

            {/* content */}
            <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h3 className="font-bold text-[hsl(var(--foreground))] text-base leading-tight">
                            {bike.name}
                        </h3>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                            #{bike.serialNumber}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="font-extrabold text-[hsl(var(--primary))] text-lg leading-none">
                            {formatPeso(bike.ratePerHour)}
                        </p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">/hour</p>
                    </div>
                </div>

                {/* starts now */}
                <div className="flex items-center gap-3 text-xs text-[hsl(var(--muted-foreground))] mb-4">
                    <span className="flex items-center gap-1">
                        <BikeIcon size={12} />
                        {bike.totalTrips} trips
                    </span>
                    <span>•</span>
                    <span>{bike.category} • {bike.style}</span>
                </div>

                {/* CTA */}
                <Link to={ROUTES.BIKE_DETAIL(bike._id)}>
                    <Button
                        fullWidth
                        variant={isAvailable ? 'primary' : 'outline'}
                        size="sm"
                        disabled={!isAvailable}>
                        {isAvailable ? 'Book Now' : statusLabel[bike.status]}
                    </Button>
                </Link>
            </div>
        </div>
    )
}