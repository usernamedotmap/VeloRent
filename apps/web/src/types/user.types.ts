export type UserRole = 'admin' | 'operator' | 'customer';

export interface User {
    _id: string;
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    rfid?: string;
    phone: string;
    role: UserRole;
    isVerified: boolean;
}

