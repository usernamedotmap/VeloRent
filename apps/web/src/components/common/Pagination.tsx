import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";



interface Props {
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    onNext: () => void;
    onPrev: () => void;
    onPage: (page: number) => void;
}

export default function Pagination({
    page, totalPages, hasNext, hasPrev, onNext, onPrev, onPage
}: Props) {
    if (totalPages <= 1) return null;

    // show max 5 page numbers
    const getPage = () => {
        const pages: number[] = [];
        const start = Math.max(1, page - 2);
        const end = Math.min(totalPages, start + 4);
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-2 mt-8">
            <Button
                variant="outline"
                size="sm"
                onClick={onPrev}
                disabled={!hasPrev}>
                <ChevronLeft size={16} />
            </Button>

            {getPage().map((p) => (
                <button
                    key={p}
                    onClick={() => onPage(p)}
                    className={cn(
                        'w-9 h-9 rounded-lg text-sm font-semibold transition-all',
                        p === page
                            ? 'bg-[hsl(var(--primary))] text-white shadow-sm'
                            : 'bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]'
                    )}>
                    {p}
                </button>
            ))}

            <Button
                variant="outline"
                size="sm"
                onClick={onNext}
                disabled={!hasNext}>
                <ChevronRight size={16} />
            </Button>
        </div>
    )
}