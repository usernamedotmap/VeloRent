import { cn } from "@/lib/utils";


export type PaymentMethod = 'gcash' | 'paymaya' | 'card' | 'qrph';

interface Props {
    selected: PaymentMethod | null;
    onSelect: (method: PaymentMethod) => void;
}


const METHODS = [
    {
        id: 'qrph' as PaymentMethod,
        label: 'QR Ph',
        emoji: '📱',
        color: 'hover:border-blue-400',
        active: 'border-blue-500 bg-blue-50',
        desc: 'GCash, Maya, BPI + 30 banks',
        available: true,
        badge: 'Test only',
    },
    {
        id: 'gcash' as PaymentMethod,
        label: 'GCash',
        emoji: '💙',
        color: 'hover:border-blue-400',
        active: 'border-blue-500 bg-blue-50',
        desc: 'Pay via Gcash app',
        available: true,
        badge: 'Test only',
    },
    {
        id: 'paymaya' as PaymentMethod,
        label: 'Maya',
        emoji: '💚',
        color: 'hover:border-green-400',
        active: 'border-green-500 bg-green-50',
        desc: 'Pay via Maya app',
        available: true,
        badge: 'Test only'
    },
    {
        id: 'card' as PaymentMethod,
        label: 'Card',
        emoji: '💳',
        color: 'hover:border-[hsl(var(--primary)/0.5)]',
        active: 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)]',
        desc: 'Visa / Mastercard',
        available: true,
        badge: 'Test only'
    },
];

export default function PaymentMethodSelector({ selected, onSelect }: Props) {
    return (
        <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
                {METHODS.map(({ id, label, emoji, color, active, desc, available, badge }) => (
                    <button
                        key={id}
                        onClick={() => available && onSelect(id)}
                        disabled={!available}
                        className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all text-center
                        ${!available ? 'opacity-40 cursor-not-allowed border-[hsl(var(--border))] bg-[hsl(var(muted)/0.5)]'
                                : selected === id
                                    ? active
                                    : `border-[hsl(var(--border))] bg-[hsl(var(--card))] ${color}`}`}>
                        {/* badge */}
                        {badge && (
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                                {badge}
                            </div>
                        )}
                        <span className="text-3xl">{emoji}</span>
                        <span className="font-bold text-sm text-[hsl(var(--foreground))]">
                            {label}
                        </span>
                        <span className="text-xs text-[hsl(var(--muted-foreground))]">
                            {desc}
                        </span>
                        {selected === id && (
                            <div className="w-5 h-5 rounded-full bg-[hsl(var(--primary))] text-white flex items-center justify-center text-xs">
                                ✓
                            </div>
                        )}
                    </button>
                )
                )}
            </div>

            {/* sanboax */}
            {/* <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-3 py-2.5 text-amber-700">
                <span className="shrink-0">🧪</span>
                <p>
                    <strong>Gcash & Maya</strong> are in test mode - use  registered test number only.
                    <strong> QR Ph</strong> and <strong>Card</strong> are live.
                </p>
            </div> */}
        </div>
    );
}