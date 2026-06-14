export interface DailyTrendPoint {
    date: string;
    revenue: number;
    bookings: number;
}

export interface SlotDistributionPoint {
    slotHours: number;
    count: number;
    percentage: number;
}

export interface ChannelBreakdownPoint {
    week: number;
    online: number;
    walkIn: number;
}

export interface TopBike {
    bikeId: string;
    name: string;
    serialNumber: string;
    category: string;
    style: string;
    trips: number;
}

export interface PeakHourPoint {
    hour: number;
    count: number;
}

export interface RideStatusSummary {
    pending: number;
    confirmed: number;
    active: number;
    overdue: number;
    completed: number;
    cancelled: number;
}

export interface AdminAnalytics {
    dailyTrend: DailyTrendPoint[];
    slotDistribution: SlotDistributionPoint[];
    channelBreakdown: ChannelBreakdownPoint[];
    topBikes: TopBike[];
    peakHours: PeakHourPoint[];
    rideStatusSummary: RideStatusSummary;
}