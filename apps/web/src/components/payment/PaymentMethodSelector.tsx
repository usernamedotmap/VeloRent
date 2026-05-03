import { cn } from "@/lib/utils";


export type PaymentMethod = 'gcash' | 'paymaya' | 'card';

interface Props {
    selected: PaymentMethod | null;
    onSelect: (method: PaymentMethod) => void;
}


const METHODS = [
    {
        id: 'gcash' as PaymentMethod,
        label: 'GCash',
        emoji: '💙',
        color: 'hover:border-blue-400',
        active: 'border-blue-500 bg-blue-50',
        desc: 'Pay via Gcash app',
    },
    {
        id: 'paymaya' as PaymentMethod,
        label: 'Maya',
        emoji: '💚',
        color: 'hover:border-green-400',
        active: 'border-green-500 bg-green-50',
        desc: 'Pay via Maya app',
    },
    {
        id: 'card' as PaymentMethod,
        label: 'Card',
        emoji: '💳',
        color: 'hover:border-[hsl(var(--primary)/0.5)]',
        active: 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)]',
        desc: 'Visa / Mastercard',
    },
];

export default function PaymentMethodSelector({ selected, onSelect }: Props) {
    return (
        <div className="grid grid-cols-3 gap-3">
            {METHODS.map(({ id, label, emoji, color, active, desc }) => (
                <button
                    key={id}
                    onClick={() => onSelect(id)}
                    className={cn(
                        'flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all text-center',
                        selected === id
                            ? active
                            : `border-[hsl(var(--border))] bg-[hsl(var(--card))] ${color}`
                    )}>
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
    );
}