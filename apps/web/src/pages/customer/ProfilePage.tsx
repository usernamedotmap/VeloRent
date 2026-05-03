import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { useMe } from '@/hooks/useAuth';
import { getInitials } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store'
import React from 'react'

const ProfilePage = () => {
    const user = useAuthStore((s) => s.user);
    useMe();
    return (
        <div className="max-w-2xl space-y-6">
            <h1 className="text-2xl font-extrabold text-[hsl(var(--foreground))]">
                My Profile
            </h1>

            {/* AVatar + name */}
            <Card>
                <CardBody className='py-6'>
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--primary))] flex items-center justify-center text-white text-2xl font-extrabold">
                            {user ? getInitials(user.firstName, user.lastName) : '?'}
                        </div>
                        <div>
                            <h2 className='text-xl font-extrabold text-[hsl(var(--foreground))]'>
                                {user?.firstName} {user?.lastName}
                            </h2>
                            <p className='text-sm text-[hsl(var(--muted-foreground))] capitalize'>
                                {user?.role} account
                            </p>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* details */}
            <Card>
                <CardHeader>
                    <h3 className='font-bold text-[hsl(var(--foreground))]'>
                        Account Details
                    </h3>
                </CardHeader>
                <CardBody>
                    <div className='space-y-4'>
                        {[
                            { label: 'First Name', value: user?.firstName },
                            { label: 'Last Name', value: user?.lastName },
                            { label: 'Email', value: user?.email },
                            { label: 'Phone', value: user?.phone },
                            { label: 'Account Type', value: user?.role },
                            { label: 'Verification', value: user?.isVerified ? '✅ Verified' : '⏳ Pending', },
                        ].map(({ label, value }) => (
                            <div key={label}
                                className='flex justify-between py-3 border-b border-[hsl(var(--border))] last:border-0'>
                                <span className='text-sm text-[hsl(var(--muted-foreground))] font-medium'>
                                    {label}
                                </span>
                                <span className='text-sm font-semibold text-[hsl(var(--foreground))] capitalize'>
                                    {value ?? '—'}
                                </span>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>

            <p className='text-xs text-center text-[hsl(var(--muted-foreground))]'>
                To update your profile details, please contact the park administrator.
            </p>
        </div>
    );
}

export default ProfilePage;
