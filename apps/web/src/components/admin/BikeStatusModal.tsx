import { useUPdateBikeStatus } from "@/hooks/useBike";
import { Bike } from "@/types/bike.types";
import { CheckCircle, Wrench, X } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";



interface Props {
    bike: Bike;
    onClose: () => void;
    onSuccess: () => void;
}


export default function BikeStatusModal({ bike, onClose, onSuccess }: Props) {
    const [note, setNote] = useState('');
    const [status, setStatus] = useState<'available' | 'maintenance' | 'retired'>('maintenance');

    const { mutate, isPending, error } = useUPdateBikeStatus(bike._id);
    const errMsg = (error as any)?.response?.data?.error?.message;

    const handleSubmit = () => {
        mutate({ status, note: note || undefined }, { onSuccess });
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[hsl(var(--card))] rounded-3xl border border-[hsl(var(--border))] shadow-2xl w-full max-w-md">

                {/* header */}
                <div className="flex items-center justify-between p-6 border-b border-[hsl(var(--border))]">
                    <h3 className="font-bold text-[hsl(var(--foreground))] text-lg">
                        Update Bike Status
                    </h3>
                    <button onClick={onClose}>
                        <X size={20} className="text-[hsl(var(--muted-foreground))]" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    <div className="bg-[hsl(var(--muted))] rounded-xl p-3 text-sm">
                        <p className="font-semibold text-[hsl(var(--foreground))]">{bike.name}</p>
                        <p className="text-[hsl(var(--muted-foreground))]">
                            Current status: <strong>{bike.status}</strong>
                        </p>
                    </div>

                    {errMsg && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                            {errMsg}
                        </div>
                    )}

                    {/* stuts options */}
                    <div className="space-y-2">
                        <p className="text-sm font-semibold text-[hsl(var(--foreground))]">New Status</p>
                        {[
                            { value: 'available' as const, label: 'Available', icon: CheckCircle, color: 'text-green-600' },
                            { value: 'maintenance' as const, label: 'Maintenance', icon: Wrench, color: 'text-amber-600' },
                            { value: 'retired' as const, label: 'Retired', icon: X, color: 'text-red-600' },
                        ].map(({ value, label, icon: Icon, color }) => (
                            <button
                                key={value}
                                onClick={() => setStatus(value)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${status === value
                                    ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.06)]'
                                    : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)]'}`}>
                                <Icon size={18} className={color} />
                                <span className="font-semibold text-sm">{label}</span>
                            </button>
                        ))}
                    </div>

                    {/* note - required for mainteenance */}
                    {status === 'maintenance' && (
                        <div>
                            <label className="block text-sm font-semibold text-[hsl(var(--foreground))]">
                                Maintenance Note <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Describe the maintenance needed..."
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)] focus:border-[hsl(var(--primary))] resize-none"
                            />
                        </div>
                    )}

                    <div className="flex gap-3">
                        <Button variant="outline" fullWidth onClick={onClose} disabled={isPending}>
                            Cancel
                        </Button>
                        <Button
                        fullWidth
                        loading={isPending}
                        disabled={status === 'maintenance' && !note.trim()}
                        variant={status === 'retired' ? 'danger' : 'primary'}
                        onClick={handleSubmit}>
                            Update Status
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}