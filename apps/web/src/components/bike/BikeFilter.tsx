import { BikeCategory, BikeFilters, BikeStatus, BikeStyle } from "@/types/bike.types";
import { SlidersHorizontal, X } from "lucide-react";


interface Props {
    filters: BikeFilters;
    onChange: (filters: BikeFilters) => void;
    onReset: () => void;
}

const categories: { value: BikeCategory; label: string; emoji: string }[] = [
    { value: 'solo', label: 'Solo', emoji: '🚴' },
    { value: 'kid', label: 'Kid', emoji: '👦' },
    { value: 'family', label: 'Family', emoji: '👨‍👩‍👧' },
];

const styles: { value: BikeStyle; label: string }[] = [
    { value: 'standard', label: 'Standard' },
    { value: 'mountain', label: 'Mountain' },
    { value: 'bmx', label: 'BMX' },
];

const statuses: { value: BikeStatus; label: string }[] = [
    { value: 'available', label: 'Available' },
    { value: 'in_use', label: 'In Use' },
    { value: 'maintenance', label: 'Maintenance' },
];

const FilterChip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button onClick={onClick} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${active
        ? 'bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))] shadow-sm'
        : 'bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]'
        }`}>
        {children}
    </button>
);

export default function BikeFilter({ filters, onChange, onReset }: Props) {
    const hasActiveFilters = !!(filters.category || filters.style || filters.status);

    return (
        <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-5">

            {/* header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 font-semibold text-[hsl(var(--foreground))]">
                    <SlidersHorizontal size={16} className="text-[hsl(var(--primary))]" />
                    Filters
                </div>
                {hasActiveFilters && (
                    <button
                        onClick={onReset}
                        className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))] hover:text-red-500 transition-colors">
                        <X size={12} />
                        Clear all
                    </button>
                )}
            </div>

            {/* category */}
            <div className="mb-4">
                <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-2">
                    Category
                </p>
                <div className="flex flex-wrap gap-2">
                    {categories.map(({ value, label, emoji }) => (
                        <FilterChip
                            key={value}
                            active={filters.category === value}
                            onClick={() => onChange({
                                ...filters,
                                category: filters.category === value ? undefined : value,
                                page: 1,
                            })}>
                            {emoji} {label}
                        </FilterChip>
                    ))}
                </div>
            </div>

            {/* style */}
            <div className="mb-4">
                <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-2">
                    Style
                </p>
                <div className="flex flex-wrap gap-2">
                    {styles.map(({ value, label }) => (
                        <FilterChip
                            key={value}
                            active={filters.style === value}
                            onClick={() => onChange({
                                ...filters,
                                style: filters.style === value ? undefined : value,
                                page: 1
                            })}>
                            {label}
                        </FilterChip>
                    ))}
                </div>
            </div>

            {/* status */}
            <div>
                <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-2">
                    Availability
                </p>
                <div className="flex flex-wrap gap-2">
                    {statuses.map(({ value, label }) => (
                        <FilterChip
                            key={value}
                            active={filters.status === value}
                            onClick={() => onChange({
                                ...filters,
                                status: filters.status === value ? undefined : value,
                                page: 1
                            })}>
                            {label}
                        </FilterChip>
                    ))}
                </div>
            </div>
        </div>
    )
}