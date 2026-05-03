export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "active"
  | "completed"
  | "cancelled"
  | "overdue";
export type ItemStatus = "waiting" | "active" | "completed" | "overdue";
export type BookingChannel = "online" | "walk_in";

export interface ReservationItem {
  _id: string;
  bikeId:
    | string
    | {
        _id: string;
        name: string;
        category: string;
        style: string;
        serialNumber: string;
        imageUrls: string[]
      };
      status: ItemStatus;
      actualStart?: string;
      actualEnd?: string;
      overdueCost: number;
      timerSessionId?: string;
}

export interface Reservation {
    _id: string;
    userId: string | {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    };
    channel: BookingChannel;
    status: ReservationStatus;
    slotHours: 1 | 2 | 3;
    items: ReservationItem[];
    baseCost: number;
    totalCost: number;
    scheduledStart: string;
    paymentId: string | {
        _id: string;
        amount: number;
        status: string;
        provider: string;
    };
    cancellationReason?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ReservationFilters {
    status?: ReservationStatus;
    channel?: BookingChannel;
    page?: number;
    limit?: number;
    [key: string]: unknown;
}
