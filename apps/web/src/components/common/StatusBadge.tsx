import React from 'react'
import { Badge } from '../ui/badge';

type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'active' | 'overdue';

type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';

type ItemStatus = 'waiting' | 'active' | 'completed' | 'overdue';


const reservationConfig: Record<ReservationStatus, {
    variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
    label: string;
    emoji: string;
}> = {
    pending: { variant: 'warning', label: 'Pending', emoji: '⏳' },
    confirmed: { variant: 'success', label: 'Confirmed', emoji: '✅' },
    cancelled: { variant: 'danger', label: 'Cancelled', emoji: '❌' },
    completed: { variant: 'success', label: 'Completed', emoji: '🎉' },
    active: { variant: 'info', label: 'Active', emoji: '🔵' },
    overdue: { variant: 'danger', label: 'Overdue', emoji: '⚠️' },
};

const paymentConfig: Record<PaymentStatus, {
    variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
    label: string;
}> = {
    pending: { variant: 'warning', label: 'Pending' },
    paid: { variant: 'success', label: 'Paid' },
    failed: { variant: 'danger', label: 'Failed' },
    refunded: { variant: 'info', label: 'Refunded' },
    cancelled: { variant: 'danger', label: 'Cancelled' },
};

const itemConfig: Record<ItemStatus, {
    variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
    label: string;
}> = {
    waiting: { variant: 'default', label: 'Waiting' },
    active: { variant: 'success', label: 'Riding' },
    completed: { variant: 'outline', label: 'Returned' },
    overdue: { variant: 'danger', label: 'Overdue' },
};

export function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
    const config = reservationConfig[status];
    return (
        <Badge variant={config.variant}>
            {config.emoji} {config.label}
        </Badge>
    );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
    const config = paymentConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function ItemStatusBadge({ status }: { status: ItemStatus }) {
    const config = itemConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
}


