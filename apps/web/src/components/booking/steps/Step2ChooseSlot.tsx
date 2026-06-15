import { useBookingStore } from '@/stores/booking.store';
import { Button }          from '@/components/ui/button';
import { formatPeso }      from '@/lib/utils';
import { cn }              from '@/lib/utils';
import { Clock, Calendar } from 'lucide-react';

const SLOT_OPTIONS: { hours: 1 | 2 | 3; label: string; desc: string }[] = [
  { hours: 1, label: '1 Hour',   desc: 'Quick ride around the park' },
  { hours: 2, label: '2 Hours',  desc: 'Explore at a relaxed pace'  },
  { hours: 3, label: '3 Hours',  desc: 'Full park adventure'        },
];

export default function Step2ChooseSlot() {
  const slotHours       = useBookingStore((s) => s.slotHours);
  const scheduledStart  = useBookingStore((s) => s.scheduledStart);
  const selectedBikes   = useBookingStore((s) => s.selectedBikes);
  const setSlotHours    = useBookingStore((s) => s.setSlotHours);
  const setScheduledStart = useBookingStore((s) => s.setScheduledStart);
  const setStep         = useBookingStore((s) => s.setStep);
  const canProceed      = useBookingStore((s) => s.canProceedStep2());
  const totalCost       = useBookingStore((s) => s.totalCost());

  // Min datetime — now (today)
  const minDate = new Date();
  minDate.setMinutes(minDate.getMinutes() - minDate.getTimezoneOffset());
  const minDateStr = minDate.toISOString().slice(0, 16);

  return (
    <div className="space-y-8">

      {/* Slot selector */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock size={18} className="text-[hsl(var(--primary))]" />
          <h3 className="font-bold text-[hsl(var(--foreground))]">
            How long do you want to ride?
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SLOT_OPTIONS.map(({ hours, label, desc }) => {
            const cost      = selectedBikes.length * hours * 15000;
            const isActive  = slotHours === hours;

            return (
              <button
                key={hours}
                onClick={() => setSlotHours(hours)}
                className={cn(
                  'relative p-5 rounded-2xl border-2 text-left transition-all',
                  'hover:border-[hsl(var(--primary)/0.5)] hover:shadow-sm',
                  isActive
                    ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.06)] shadow-md shadow-[hsl(var(--primary)/0.15)]'
                    : 'border-[hsl(var(--border))] bg-[hsl(var(--card))]'
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute top-3 right-3 w-5 h-5 bg-[hsl(var(--primary))] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}

                <div className="text-2xl mb-2">
                  {hours === 1 ? '⚡' : hours === 2 ? '🌿' : '🏆'}
                </div>
                <div className={cn(
                  'font-extrabold text-lg mb-1',
                  isActive
                    ? 'text-[hsl(var(--primary))]'
                    : 'text-[hsl(var(--foreground))]'
                )}>
                  {label}
                </div>
                <div className="text-xs text-[hsl(var(--muted-foreground))] mb-3">
                  {desc}
                </div>
                <div className={cn(
                  'font-bold text-sm',
                  isActive ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--foreground))]'
                )}>
                  {formatPeso(cost)}
                </div>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">
                  for {selectedBikes.length} bike{selectedBikes.length > 1 ? 's' : ''}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Date + time picker */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={18} className="text-[hsl(var(--primary))]" />
          <h3 className="font-bold text-[hsl(var(--foreground))]">
            When do you want to start?
          </h3>
        </div>

        <div className="max-w-sm">
          <input
            type="datetime-local"
            min={minDateStr}
            value={scheduledStart}
            onChange={(e) => setScheduledStart(e.target.value)}
            className={cn(
              'w-full px-4 py-3 rounded-xl border bg-[hsl(var(--card))] text-[hsl(var(--foreground))]',
              'text-sm outline-none transition-all',
              'focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)] focus:border-[hsl(var(--primary))]',
              'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)]'
            )}
          />
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">
            📍 You must be at the counter by your scheduled time.
          </p>
        </div>
      </div>

      {/* Cost summary */}
      {totalCost > 0 && (
        <div className="bg-[hsl(var(--primary)/0.06)] border border-[hsl(var(--primary)/0.2)] rounded-2xl p-5">
          <h4 className="font-bold text-[hsl(var(--foreground))] mb-3">
            Cost Summary
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-[hsl(var(--muted-foreground))]">
              <span>{selectedBikes.length} bike{selectedBikes.length > 1 ? 's' : ''} × {slotHours}hr × ₱150</span>
              <span className="font-semibold text-[hsl(var(--foreground))]">
                {formatPeso(totalCost)}
              </span>
            </div>
            <div className="border-t border-[hsl(var(--primary)/0.2)] pt-2 flex justify-between font-bold text-[hsl(var(--foreground))]">
              <span>Total</span>
              <span className="text-[hsl(var(--primary))] text-lg">
                {formatPeso(totalCost)}
              </span>
            </div>
          </div>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">
            ⚠️ ₱50 overdue charge per 15 min past your slot.
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-[hsl(var(--border))]">k
        <Button className="w-full sm:w-auto" variant="outline" onClick={() => setStep(1)}>
          ← Back
        </Button>
        <Button className="w-full sm:w-auto" onClick={() => setStep(3)} disabled={!canProceed} size="lg">
          Next — Review →
        </Button>
      </div>
    </div>
  );
}