import { Bike } from "@/types/bike.types";
import BikeCard from "./BikeCard";

interface Props {
    bikes: Bike[];
    isLoading: boolean;
    isEmpty: boolean;
}

const SkeletonCard = () => (
    <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] overflow-hidden animate-pulse">
        <div className="h-44 bg-[hsl(var(--muted))]" />
        <div className="p-5 space-y-3">
            <div className="h-4 bg-[hsl(var(--muted))] rounded w-3/4" />
            <div className="h-3 bg-[hsl(var(--muted))] rounded w-1/2" />
            <div className="h-9 bg-[hsl(var(--muted))] rounded-xl mt-4" />
        </div>
    </div>
);

export default function BikeGrid({ bikes, isLoading, isEmpty }: Props) {
    if (isLoading) {
        return (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
                ))}
            </div>
        );
    }

    if (isEmpty) {
        return (
            <div className="text-center py-20">
                <div className="text-6xl mb-4">🚲</div>
                <h3 className="text-lg font-bold text-[hsl(var(--foreground))] mb-2">
                    No bikes found
                </h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    Try adjusting your filters or check back later.
                </p>
            </div>
        )
    }

    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bikes.map((bike) => (
                <BikeCard key={bike._id} bike={bike} />
            ))}
        </div>
    )
}