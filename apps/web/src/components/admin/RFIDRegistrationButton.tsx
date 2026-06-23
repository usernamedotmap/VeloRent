import { useState, useEffect }  from 'react';
import { api }                  from '@/lib/axios';
import { Button }               from '@/components/ui/button';
import { CreditCard, Loader2, Wifi, WifiOff, CheckCircle, XCircle } from 'lucide-react';
import { connectSocket }        from '@/lib/socket';

type State = 'idle' | 'waiting' | 'success' | 'error' | 'timeout' | 'duplicate';

interface Props {
  userId:     string;
  userName:   string;
  currentUid?: string;
  deviceId?:  string;
  onSuccess:  (uid: string) => void;
}

export default function RFIDRegisterButton({
  userId,
  userName,
  currentUid,
  deviceId = 'arduino-001',
  onSuccess,
}: Props) {
  const [state,   setState]   = useState<State>('idle');
  const [message, setMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => setState('idle');
  }, []);

  // Countdown timer while waiting
  useEffect(() => {
    if (state !== 'waiting') return;

    setTimeLeft(30);
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state]);

  const handleRegister = async () => {
    setState('waiting');
    setMessage('Tap the card on the reader now...');

    const socket = connectSocket();
    const socketId = socket.id;

    // Listen for backend → operator events
    const onRegistered = ({ uid }: { uid: string }) => {
      cleanup();
      setState('success');
      setMessage(`Card registered: ${uid}`);
      onSuccess(uid);
      setTimeout(() => setState('idle'), 4000);
    };

    const onFailed = ({ message: msg }: { message: string }) => {
      cleanup();
      setState('duplicate');
      setMessage(msg);
      setTimeout(() => setState('idle'), 4000);
    };

    const onTimeout = () => {
      cleanup();
      setState('timeout');
      setMessage('No card scanned — window expired.');
      setTimeout(() => setState('idle'), 3000);
    };

    const cleanup = () => {
      socket.off('rfid:registered',      onRegistered);
      socket.off('rfid:register-failed', onFailed);
      socket.off('rfid:register-timeout', onTimeout);
    };

    socket.on('rfid:registered',       onRegistered);
    socket.on('rfid:register-failed',  onFailed);
    socket.on('rfid:register-timeout', onTimeout);

    try {
      await api.post('/admin/rfid/register', {
        userId,
        deviceId,
        socketId,
      });
    } catch (err: any) {
      cleanup();
      setState('error');
      setMessage(err?.response?.data?.error?.message ?? 'Failed to start registration');
      setTimeout(() => setState('idle'), 3000);
    }
  };

  const handleCancel = () => {
    setState('idle');
    setMessage('');
  };

  return (
    <div className="flex flex-col gap-1.5 min-w-[160px]">

      {/* Button */}
      {state === 'idle' && (
        <Button size="sm" variant={currentUid ? 'outline' : 'primary'} onClick={handleRegister}>
          <CreditCard size={13} className="mr-1.5" />
          {currentUid ? 'Update Card' : 'Register Card'}
        </Button>
      )}

      {state === 'waiting' && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            <Wifi size={13} className="text-amber-500 animate-pulse shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-amber-700">Waiting for card...</p>
              <p className="text-[10px] text-amber-600">Tap card on reader ({timeLeft}s)</p>
            </div>
          </div>
          <Button size="sm" variant="ghost" onClick={handleCancel} className="w-full text-xs">
            Cancel
          </Button>
        </div>
      )}

      {state === 'success' && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
          <CheckCircle size={13} className="text-green-600 shrink-0" />
          <div>
            <p className="text-xs font-bold text-green-700">Registered!</p>
            <p className="text-[10px] text-green-600 font-mono">{message.replace('Card registered: ', '')}</p>
          </div>
        </div>
      )}

      {(state === 'error' || state === 'timeout' || state === 'duplicate') && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          <XCircle size={13} className="text-red-500 shrink-0" />
          <div>
            <p className="text-xs font-bold text-red-600">
              {state === 'timeout'   ? 'Timed out'   :
               state === 'duplicate' ? 'Card in use' : 'Error'}
            </p>
            <p className="text-[10px] text-red-500">{message}</p>
          </div>
        </div>
      )}

      {/* Show current UID when idle */}
      {state === 'idle' && currentUid && (
        <p className="text-[10px] text-[hsl(var(--muted-foreground))] font-mono px-1">
          UID: {currentUid}
        </p>
      )}
    </div>
  );
}