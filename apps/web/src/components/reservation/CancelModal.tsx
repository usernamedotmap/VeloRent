import { useCancelReservation } from "@/hooks/useReservation";
import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";


interface Props {
    reservationId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CancelModal({ reservationId, onClose, onSuccess }: Props) {
    const [reason, setReason] = useState('');
    const { mutate, isPending, error } = useCancelReservation(reservationId);

    const apiError = (error as any)?.response?.data?.error?.message;

    const handleCancel = () => {
        if (!reason.trim()) return;
        mutate(reason, { onSuccess })
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[hsl(var(--card))] rounded-3xl border border-[hsl(var(--border))] shadow-2xl w-full max-w-md">


                {/* header */}
                <div className="flex items-center justify-between p-6 border-b border-[hsl(var(--primary))]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-xl">
                            <AlertTriangle size={18} className="text-red-500" />
                        </div>
                        <h3 className="font-bold text-[hsl(var(--foreground))]">
                            Cancel Reservation
                        </h3>
                    </div>
                    <button
                        onClick={handleCancel}
                        className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* body */}
                <div className="p-6 space-y-4">
                    <p className="tet-sm text-[hsl(var(--muted-foreground))]">
                        Are you sure you want to cancel this reservation?
                        If you paid online, a full refund will be processed automatically.
                    </p>

                    {apiError && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                            {apiError}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-[hsl(var(--foreground))] mb-2">
                            Reason for cancellation <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Please tell us why you're cancelling..."
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 resize-none transition-all" />
                    </div>
                </div>

                {/* footer na dito */}
                <div className="flex gap-3 p-6 pt-0">
                    <Button
                        variant="outline"
                        fullWidth
                        onClick={onClose}
                        disabled={isPending}>
                        Keep Reservation
                    </Button>
                    <Button
                        variant="danger"
                        fullWidth
                        loading={isPending}
                        disabled={!reason.trim()}
                        onClick={handleCancel}>
                        Cancel Reservation
                    </Button>
                </div>
            </div>
        </div>
    )
}