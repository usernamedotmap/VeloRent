



import BikeStatusModal from '@/components/admin/BikeStatusModal';
import BikeFormModal from '@/components/bike/BikeFormModal';
import BikeQrCode from '@/components/bike/BikeQrCode';
import PageHeader from '@/components/common/PageHeader';
import Pagination from '@/components/common/Pagination';
import ResponsiveTable from '@/components/common/ResponsiveTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useBikes } from '@/hooks/useBike';
import { formatPeso } from '@/lib/utils';
import { Bike, BikeFilters } from '@/types/bike.types';
import React, { useState } from 'react'

const statusVariant = (status: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
        case 'available': return 'secondary';
        case 'retired':
        case 'maintenance': return 'destructive';
        case 'reserved':
        case 'in_use': return 'outline';
        default: return 'default';
    }
}

const statusStyles: Record<string, string> = {
    available: "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200",
    reserved: "bg-amber-500/15 text-amber-600 hover:bg-amber-500/20 border-amber-200",
    in_use: "bg-blue-500/15 text-blue-600 hover:bg-blue-500/20 border-blue-200",
    maintenance: "bg-slate-500/15 text-slate-600 hover:bg-slate-500/20 border-slate-200",
    retired: "bg-red-500/15 text-red-600 hover:bg-red-500/20 border-red-200",
}

const AdminBikesPage = () => {
    const [qrBike, setQrBike] = useState<Bike | null>(null);
    const [filters, setFilters] = useState<BikeFilters>({ page: 1, limit: 10 });
    const [showCreate, setShowCreate] = useState(false);
    const [editBike, setEditBike] = useState<Bike | null>(null);
    const [statusBike, setStatusBike] = useState<Bike | null>(null);

    const { data, isLoading, refetch } = useBikes(filters);
    const bikes = data?.data ?? [];
    const pagination = data?.meta;

    const handleSuccess = () => {
        setShowCreate(false);
        setEditBike(null);
        setStatusBike(null);
        refetch();
    }
    return (
        <div className='p-8 space-y-6'>
            <PageHeader
                title='Bike Fleet'
                description='Manage all bikes in the fleet'
                action={
                    <Button onClick={() => setShowCreate(true)}>+ Add Bike</Button>
                } />

            {/* table */}
            <div className='bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] overflow-hidden'>
                <ResponsiveTable
                    keyField="_id"
                    isLoading={isLoading}
                    emptyText='No bikes found'
                    data={bikes}
                    colums={[
                        {
                            key: 'serialNumber',
                            label: 'Serial',
                            render: (b) => (
                                <span className="font-mono text-xs text-[hsl(var(--muted-foreground))] opacity-70">
                                    {b.serialNumber}
                                </span>
                            ),
                            mobileHide: true
                        },
                        {
                            key: 'name',
                            label: "Name",
                            render: (b) => (
                                <span className='font-semibold text-foreground'>{b.name}</span>
                            )
                        },
                        {
                            key: 'type',
                            label: 'Type',
                            render: (b) => (
                                <Badge variant="outline"
                                    className={`${statusStyles[b.status]} capitalize font-medium`}>
                                    {b.status.replace('_', ' ')}
                                </Badge>
                            )
                        },
                        {
                            key: 'totalTrips',
                            label: 'Trips',
                            render: (b) => <span className="font-mono">{b.totalTrips}</span>,
                            mobileHide: true,
                        },
                        {
                            key: 'rate',
                            label: 'Rate',
                            render: (b) => <span className="font-medium">{`${formatPeso(b.ratePerHour)}/hr`}</span>,
                        },
                        {
                            key: 'actions',
                            label: 'Actions',
                            render: (b) => (
                                <div className="flex gap-2">
                                    <Button size='sm' variant='ghost'
                                        onClick={() => setEditBike(b)}>
                                        Edit
                                    </Button>
                                    {b.status !== 'retired' && (
                                        <Button size='sm' variant='ghost'
                                            onClick={() => setStatusBike(b)}>
                                            Maintenance
                                        </Button>
                                    )}
                                    <Button
                                    size='sm'
                                    variant='ghost'
                                    onClick={() => setQrBike(b)}>
                                        QR Code
                                    </Button>
                                </div>
                            )
                        }

                    ]}
                />
            </div>

            {/* pagination here */}
            {pagination && (
                <Pagination
                    page={pagination.page}
                    totalPages={pagination.totalPages}
                    hasNext={pagination.hasNext}
                    hasPrev={pagination.hasPrev}
                    onNext={() => setFilters((f) => ({ ...f, page: f.page! + 1 }))}
                    onPrev={() => setFilters((f) => ({ ...f, page: f.page! - 1 }))}
                    onPage={(p) => setFilters((f) => ({ ...f, page: p }))}
                />
            )}

            {/* modals */}

            {qrBike && (
                <div className='fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
                    <div className='bg-[hsl(var(--card))] rounded-3xl border border-[hsl(var(--border))] shadow-2xl w-full max-w-sm p-6'>
                        <div className='flex items-center justify-between mb-6'>
                            <h3 className='font-bold text-[hsl(var(--foreground))]'>
                                Bike QR Code
                            </h3>
                            <button
                                onClick={() => setQrBike(null)}
                                className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                                X
                            </button>
                        </div>

                        <BikeQrCode
                            bikeId={qrBike._id}
                            serialNumber={qrBike.serialNumber}
                            bikeName={qrBike.name}
                            size={220}
                            showPrint={true}
                        />

                        <p className='text-xs text-center text-[hsl(var(--muted-foreground))] mt-4'>
                            Print and attach to the physical bike.
                            Customers scan to view and book.
                        </p>
                    </div>
                </div>
            )}



            {showCreate && (
                <BikeFormModal
                    onClose={() => setShowCreate(false)}
                    onSuccess={handleSuccess}
                />
            )}

            {editBike && (
                <BikeFormModal
                    bike={editBike}
                    onClose={() => setEditBike(null)}
                    onSuccess={handleSuccess}
                />
            )}
            {statusBike && (
                <BikeStatusModal
                    bike={statusBike}
                    onClose={() => setStatusBike(null)}
                    onSuccess={handleSuccess}
                />
            )}


        </div>
    )
}

export default AdminBikesPage;
