import BikeFilter from "@/components/bike/BikeFilter";
import BikeGrid from "@/components/bike/BikeGrid";
import Pagination from "@/components/common/Pagination";
import { useBikes } from "@/hooks/useBike";
import { BikeFilters } from "@/types/bike.types";
import { Leaf } from "lucide-react";
import { useState } from "react";


const DEFAULT_FILTERS: BikeFilters = {
  page: 1,
  limit: 9,
};

export default function BikesPage() {
  const [filters, setFilters] = useState<BikeFilters>(DEFAULT_FILTERS);
  const { data, isLoading } = useBikes(filters);

  const bikes = data?.data ?? [];
  const pagination = data?.meta;

  const handleFilterChange = (newFilters: BikeFilters) =>
    setFilters({ ...newFilters, limit: 9 });

  const handleReset = () => setFilters(DEFAULT_FILTERS);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">

      {/* page hero */}
      <div className="bg-linear-to-br from-[hsl(var(--primary)/0.08)] to-[hsl(var(--background))] border-b border-[hsl(var(--border))] py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="inline-flex items-center gap-2 bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] text-sm font-semibold px-4 py-1.5 rounded-full mb-4 border border-[hsl(var(--primary)/0.2)]">
            <Leaf size={14} />
            Eco-Friendly Fleet
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[hsl(var(--foreground))] mb-3">
            Find Your Perfect Ride
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] max-w-lg">
            Browse our fleet of bikes for every rider.
            All bikes at a flat rate of ₱150/hour.
          </p>
        </div>
      </div>

      {/* content */}
      <div className="container mx-auto px-4 max-w-6xl py-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* sidebar filters */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="lg:sticky lg:top-24">
              <BikeFilter
                filters={filters}
                onChange={handleFilterChange}
                onReset={handleReset}
              />

              {/* result cocunt */}
              {!isLoading && pagination && (
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-4 text-center">
                  Showing{' '}
                  <span className="font-semibold text-[hsl(var(--foreground))]">
                    {bikes.length}
                  </span>
                  {' '}of{' '}
                  <span className="font-semibold text-[hsl(var(--foreground))]">
                    {pagination.total}
                  </span>
                  {' '}bikes
                </p>
              )}
            </div>
          </aside>

          {/* bikes grid dito */}
          <div className="flex-1">
            <BikeGrid
              bikes={bikes}
              isLoading={isLoading}
              isEmpty={!isLoading && bikes.length === 0}
            />

            {/* pagination */}
            <Pagination
              page={pagination?.page ?? 1}
              totalPages={pagination?.totalPages ?? 0}
              hasNext={pagination?.hasNext ?? false}
              hasPrev={pagination?.hasPrev ?? false}
              onNext={() => setFilters((f) => ({ ...f, page: f.page! + 1 }))}
              onPrev={() => setFilters((f) => ({ ...f, page: f.page! - 1 }))}
              onPage={(p) => setFilters((f) => ({ ...f, page: p }))}
            />
          </div>
        </div>
      </div>
    </div>
  )
}