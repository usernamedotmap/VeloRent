
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
export type PaymentProvider = 'paymongo' | 'cash' | 'beep';

export interface Payment {
    _id: string;
    reservationId: string;
    userId: string;
    provider: PaymentProvider;
    providerRef?: string;
    clientKey?: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    paidAt?: string;
    refundedAt?: string;    
    createdAt: string;
    updatedAt: string;
}