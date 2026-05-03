export type UserRole = 'admin' | 'operator' | 'customer';

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: UserRole;
    isVerified: boolean;
}

