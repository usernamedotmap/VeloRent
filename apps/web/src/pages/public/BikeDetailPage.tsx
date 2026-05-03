import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constant/routes';
import { useBike } from '@/hooks/useBike';
import { formatBikeType, formatPeso } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { ArrowLeft, Bike, Clock, Shield } from 'lucide-react';
import React from 'react'
import { Link, useParams } from 'react-router-dom';


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

const BikeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: bike, isLoading } = useBike(id!);
  const user = useAuthStore((s) => s.user);

  if (isLoading) {
    return (
      <div className='container mx-auto px-4 max-w-4xl py-10 space-y-6'>
        <div className='h-72 bg-[hsl(var(--muted))] rounded-3xl animate-pulse' />
        <div className='h-8 bg-[hsl(var(--muted))] rounded animate-pulse w-1/2' />
        <div className='h-4 bg-[hsl(var(--muted))] rounded animate-pulse w-1/3' />
      </div>
    );
  }

  if (!bike) {
    return (
      <div className="container mx-auto px-4 max-w-4xl py-20 text-center">
        <div className="text-5xl mb-4">🚲</div>
        <h2 className="text-xl font-bold mb-2">Bike not found</h2>
        <Link to={ROUTES.BIKES}>
          <Button variant='outline'>← Back to bikes</Button>
        </Link>
      </div>
    );
  }

  const isAvailable = bike.status === 'available';
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="container mx-auto px-4 max-w-4xl py-8">

        {/* back */}
        <Link
          to={ROUTES.BIKES}
          className="inline-flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors mb-6">
          <ArrowLeft size={16} />
          Back to bikes
        </Link>

        <div className="grid md:grid-cols-2 gap-8">

          {/* left image */}
          <div>
            <div className="aspect-square bg-linear-to-br from-[hsl(var(--muted))] to-[hsl(138, 30%, 90%)] rounded-3xl flex items-center justify-center relative overflow-hidden">
              {bike.imageUrls.length > 0 ? (
                <img
                  src={bike.imageUrls[0]}
                  alt={bike.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-9xl opacity-30">🚲</span>
              )}
              <div className="absolute top-4 right-4">
                <Badge variant="outline"
                  className={`${statusStyles[bike.status]}`} >
                  {bike.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>

            {/* image thumbnails if multiple */}
            {bike.imageUrls.length > 1 && (
              <div className="flex gap-2 mt-3">
                {bike.imageUrls.slice(0, 4).map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`${bike.name} ${i + 1}`}
                    className="w-16 h-16 rounded-xl object-cover border-2 border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] cursor-pointer transition-colors"
                  />
                ))}
              </div>
            )}
          </div>

          {/* right - details */}
          <div className="space-y-5">

            {/* name + type */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant='outline'>
                  {formatBikeType(bike.category, bike.style)}
                </Badge>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                  #{bike.serialNumber}
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-[hsl(var(--foreground))]">
                {bike.name}
              </h1>
            </div>

            {/* price */}
            <div className='bg-[hsl(var(--primary)/0.06)] border border-[hsl(var(--primary)/0.2)] rounded-2xl p-4 '>
              <p className="text-sm test-[hsl(var(--muted-foreground))] mb-1">
                Rate per hour
              </p>
              <p className='text-4xl font-extrabold text-[hsl(var(--primary))]'>
                {formatPeso(bike.ratePerHour)}
              </p>
              <p className='text-xs text-[hsl(var(--muted-foreground))] mt-1'>
                Flat rate - all bike types same price 🌿
              </p>
            </div>

            {/* status */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Bike, label: 'Total Rides', value: bike.totalTrips },
                { icon: Clock, label: 'Slot Options', value: '1, 2 or 3 hours' },
                { icon: Shield, label: 'Maintained', value: 'Regularly' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-[hs(var(--card))] rounded-xl border border-[hsl(var(--border))] p-3 text-center">
                  <Icon size={18} className="text-[hsl(var(--primary))] mx-auto mb-1" />
                  <p className="font-bold text-sm text-[hsl(var(--foreground))]">{value}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{label}</p>
                </div>
              ))}
            </div>

            {/* availability info */}
            {!isAvailable && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-sm text-amber-700">
                ⚠️ This bike is currently <strong>{bike.status.replace('_', ' ')}</strong>.
                Check back later or browse other bikes.
              </div>
            )}

            {/* CTA */}
            {user ? (
              <Link
                to={isAvailable
                  ? `${ROUTES.RESERVATION_NEW}?bikeId=${bike._id}`
                  : ROUTES.BIKES
                }>
                <Button
                  fullWidth
                  size='lg'
                  variant={isAvailable ? 'primary' : 'outline'}>
                  {isAvailable ? '🚲 Book This Bike' : 'Browse Available Bikes'}
                </Button>
              </Link>
            ) : (
              <div className="space-y-3">
                <Link to={`${ROUTES.LOGIN}?redirect=${encodeURIComponent(
                  isAvailable
                    ? `${ROUTES.RESERVATION_NEW}?bikeId=${bike._id}`
                    : ROUTES.BIKES
                )}`}>
                  <Button fullWidth size='lg'>
                    Sign in to Book
                  </Button>
                </Link>
                <p className="text-center text-sm text-[hsl(var(--muted-foreground))] mt-1">
                  Don't have an account?{' '}
                  <Link to={`${ROUTES.REGISTER}?redirect=${encodeURIComponent(
                    `${ROUTES.RESERVATION_NEW}?bikeId=${bike._id}`
                  )}`} className="text-[hsl(var(--primary))] font-semibold hover:underline">
                    Register here
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BikeDetailPage
