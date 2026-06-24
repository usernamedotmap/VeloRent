import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useMe, useRegisterRfid } from '@/hooks/useAuth';
import { getInitials } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store'
import { CreditCard } from 'lucide-react';
import { useState } from 'react';

const ProfilePage = () => {

    const user = useAuthStore((s) => s.user);
    useMe();

    return (
        <div className="max-w-2xl mx-auto px-4 space-y-6">
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
                <CardHeader className='p-2'>
                    <h3 className='font-bold text-[hsl(var(--foreground))]'>
                        Account Details
                    </h3>
                </CardHeader>
                <CardBody>
                    <div className='space-y-4'>
                        {[
                            { label: 'First Name', value: user?.firstName, tranform: 'normal' },
                            { label: 'Last Name', value: user?.lastName, transform: 'normal' },
                            { label: 'Email', value: user?.email, transform: 'email' },
                            { label: 'Phone', value: user?.phone, transform: 'normal' },
                            { label: 'Account Type', value: user?.role, transform: 'capitalize' },
                            { label: 'Verification', value: user?.isVerified ? '✅ Verified' : '⏳ Pending', },
                        ].map(({ label, value, transform }) => {
                            const baseValueClass = 'text-sm font-semibold text-[hsl(var(--foreground))]';
                            const transformClass = transform === 'capitalize' ? 'capitalize' : transform === 'email' ? 'lowercase' : '';
                            const valueSizing = label === "Email" ? 'max-w-[60%] truncate overflow-hidden whitespace-nowrap' : 'max-w-[60%]';
                        return (
                            <div key={label}
                                className='flex justify-between py-3 border-b border-[hsl(var(--border))] last:border-0'>
                                <span className='text-sm text-[hsl(var(--muted-foreground))] font-medium'>
                                    {label}
                                </span>
                                <span className={`${baseValueClass} ${transformClass} ${valueSizing}`}>
                                    {value ?? '—'}  
                                </span>
                            </div>
                            )
                        })}
                    </div>
                </CardBody>
            </Card> 

          
            {/* <RFIDCardSection currentUid={user?.rfidUid}  />
            <p className='text-xs text-center text-[hsl(var(--muted-foreground))]'>
                To update your profile details, please contact the park administrator.
            </p> */}
        </div>
    );
}

export default ProfilePage;


function RFIDCardSection({ currentUid }: { currentUid?: string }) {
  const [uid, setUid] = useState('');
  const { mutate: registerRfid, isPending, error } = useRegisterRfid();

  const errMsg = (error as any)?.response?.data?.error?.message;

  return (
    <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-6">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard size={18} className="text-[hsl(var(--primary))]" />
        <h3 className="font-bold text-[hsl(var(--foreground))]">Beep Card (RFID)</h3>
      </div>

      {currentUid ? (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4">
          <p className="text-sm font-semibold text-green-700">✅ Card registered</p>
          <p className="text-xs text-green-600 font-mono mt-1">UID: {currentUid}</p>
        </div>
      ) : (
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
          Register your RFID card to tap-to-start and tap-to-complete your rides.
        </p>
      )}

      {errMsg && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-3">
          {errMsg}
        </div>
      )}

      <div className="flex gap-3">
        <Input
          placeholder="Tap card at counter to get UID, or enter manually"
          value={uid}
          onChange={(e) => setUid(e.target.value.toUpperCase())}
        />
        <Button
          onClick={() => registerRfid({ rfidUid: uid })}
          loading={isPending}
          disabled={!uid}
        >
          {currentUid ? 'Update' : 'Register'}
        </Button>
      </div>
      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">
        Ask the operator to scan your card and read the UID from the device.
      </p>
    </div>
  );
}
