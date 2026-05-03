export type BikeCategory = 'solo' | 'kid' | 'family';
export type BikeStyle = 'standard' | 'mountain' | 'bmx';
export type BikeStatus = 'available' | 'reserved' | 'in_use' | 'maintenance' | 'retired';

export interface Bike  {
    _id: string;
    serialNumber: string;
    name: string;
    category: BikeCategory;
    style: BikeStyle;
    status: BikeStatus;
    ratePerHour: number;
    imageUrls: string[];
    totalTrips: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}


export interface BikeFilters {
    category?: BikeCategory;
    style?: BikeStyle;
    status?: BikeStatus
    page?: number;
    limit?: number;
    [key: string]: unknown;
}