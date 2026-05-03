import { attachPaymentMethod, createEWalletSource, createMayaPaymentMethod, createPaymentMethod, getIntentId, retrievePaymentIntent } from "@/lib/paymongo";
import { useAuthStore } from "@/stores/auth.store";
import { useCallback, useState } from "react";
import PaymentMethodSelector, { PaymentMethod } from "./PaymentMethodSelector";
import CardForm, { CardData } from "./CardForm";
import { formatPeso } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import PaymentStatus from "./PaymentStatus";
import ThreeDSModal from "./ThreeDSModal";


type ModalStep =
    | 'select'
    | 'card-form'
    | 'ewallet'
    | '3ds'
    | 'processing'
    | 'success'
    | 'failed'
    | 'cancelled';

interface Props {
    clientKey: string;
    amount: number;
    reservationId: string;
    onClose: () => void;
    onSuccess: () => void;
}


export default function PaymentModal({
    clientKey, amount, reservationId, onClose, onSuccess
}: Props) {
    const user = useAuthStore((s) => s.user);
    const intentId = getIntentId(clientKey);

    const [step, setStep] = useState<ModalStep>('select');
    const [method, setMethod] = useState<PaymentMethod | null>(null);
    const [cardData, setCardData] = useState<CardData | null>(null);
    const [threeDsUrl, setThreeDsUrl] = useState('');
    const [eWalletUrl, setEWalletUrl] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const billing = {
        name: user ? `${user.firstName} ${user.lastName}` : 'Customer',
        email: user?.email ?? '',
        phone: user?.phone ?? '',
    };

    const returnUrl = `${window.location.origin}/reservations/${reservationId}?payment=success`;
    const failUrl = `${window.location.origin}/reservations/${reservationId}?payment=failed`;

    // poll intent until resoleved
    const pollIntentStatus = useCallback(async () => {
        setStep('processing');
        let attempts = 0;
        const maxAttempts = 20;

        const poll = async (): Promise<void> => {
            if (attempts >= maxAttempts) {
                setStep('failed');
                setErrorMsg('Payment timed out. Please chech you reservation status.');
                return;
            }

            attempts++;

            const delay = attempts <= 5 ? 2000 : attempts <= 10 ? 4000  : 6000;
            await new Promise((r) => setTimeout(r, delay)); // wait 3s between polls

            try {
                const intent = await retrievePaymentIntent(intentId, clientKey);
                const status = intent.attributes.status;

                if (status === 'succeeded') {
                    setStep('success');
                    onSuccess();
                } else if (status === 'awaiting_next_action') {
                    // 3DS neeeded - show ifreame
                    const url = intent.attributes.next_action?.redirect?.url;
                    if (url) {
                        setThreeDsUrl(url);
                        setStep('3ds');
                    } else {
                        await poll();
                    }
                } else if (status === 'processing') {
                    await poll();
                } else {
                    setStep('failed');
                    setErrorMsg(
                        intent.attributes.last_payment_error?.failed_message ??
                        'Payment was not successful.'
                    );
                }
            } catch {
                await poll();
            }
        };

        await poll();

    }, [intentId, clientKey, onSuccess]);

    // handlecard paymnet   
    const handleCardPay = async () => {
        if (!cardData) return;
        setIsProcessing(true);
        setErrorMsg('');

        try {
            // create payment method
            const methodId = await createPaymentMethod(cardData, {
                ...billing,
                name: cardData.name
            });

            // attach to intent
            const intent = await attachPaymentMethod(
                intentId, methodId, clientKey, returnUrl
            );

            const status = intent.attributes.status;

            if (status === 'succeeded') {
                setStep('success');
                onSuccess();
            } else if (status === 'awaiting_next_action') {
                // 3ds required to ah
                const url = intent.attributes.next_action?.redirect?.url;
                if (url) {
                    setThreeDsUrl(url);
                    setStep('3ds');
                } else {
                    await pollIntentStatus();
                }
            } else {
                await pollIntentStatus();
            }
        } catch (err: any) {
            const msg = err?.response?.data?.errors?.[0]?.detail ?? 'Card payment failed.'
            setErrorMsg(msg);
        } finally {
            setIsProcessing(false);
        }
    };

    // hanlde ewallet 
    const handleEWalletPay = async () => {
        if (!method || method === 'card') return;
        setIsProcessing(true);
        setErrorMsg('');

        try {
            if (method === 'gcash') {
                const source = await createEWalletSource(
                    'gcash',
                    amount,
                    billing,
                    returnUrl,
                    failUrl,
                    reservationId
                );
                setEWalletUrl(source.attributes.redirect.checkout_url);
                setStep('ewallet');
                return;
            }

            if (method === 'paymaya') {
                const methodId = await createMayaPaymentMethod(billing);

                const intent = await attachPaymentMethod(
                    intentId,
                    methodId,
                    clientKey,
                    returnUrl
                );

                const status = intent.attributes.status;
                const nextAction = intent.attributes.next_action;

                if (status === 'succeeded') {
                    setStep('success');
                    onSuccess();
                    return;
                }

                if (status === 'awaiting_next_action' && nextAction?.redirect?.url) {
                    setEWalletUrl(nextAction.redirect.url);
                    setStep('ewallet');
                    return;
                }

                await pollIntentStatus();
            }
        } catch (err: any) {
            const msg =  err?.response?.data?.errors?.[0]?.detail ?? 'Payment failed.';
            setErrorMsg(msg);
        } finally {
            setIsProcessing(false);
        }
    };


    // after 3ds completes
    const handle3DSComplete = async () => {
        setStep('processing');
        await pollIntentStatus();
    };

    //  prevent close during processes
    const handleClose = () => {
        if (step === 'processing') return;
        if (step === 'success') {
            onSuccess(); return;
        }
        onSuccess();
    };

    const canClose = step !== 'processing';

    // step labels
    const STEP_LABELS: Record<ModalStep, string> = {
        select: 'Choose Payment Method',
        'card-form': 'Enter Card Details',
        ewallet: 'Complete Payment',
        '3ds': '3D Secure',
        processing: 'Processing...',
        success: 'Payment Complete',
        failed: 'Payment Failed',
        cancelled: 'Cancelled',
    };


    return (
        <>
            {/* main method */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 ">
                <div className="bg-[hsl(var(--card))] w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border border-[hsl(var(--border))] shadow-2xl overflow-hidden">

                    {/* header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--border))]">
                        <div>
                            <h3 className="font-bold text-[hsl(var(--background))]">
                                {STEP_LABELS[step]}
                            </h3>
                            {step !== 'success' && step !== 'failed' && step !== 'processing' && (
                                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                                    Total: <strong className="text-[hsl(var(--primary))]">{formatPeso(amount)}</strong>
                                </p>
                            )}
                        </div>
                        {canClose && (
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] transition-colors">
                                <X size={18} />
                            </button>
                        )}
                    </div>

                    {/* body */}
                    <div className="p-6">

                        {/* -- slected method --- */}
                        {step === 'select' && (
                            <div className="space-y-5">
                                <PaymentMethodSelector
                                    selected={method}
                                    onSelect={(m) => {
                                        setMethod(m);
                                        setErrorMsg('');
                                    }}
                                />

                                {errorMsg && (
                                    <p className="text-sm text-red-500 text-center">{errorMsg}</p>
                                )}

                                <Button
                                    fullWidth
                                    size="lg"
                                    disabled={!method}
                                    onClick={() => {
                                        if (method === 'card')
                                            setStep('card-form');
                                        else handleEWalletPay();
                                    }}
                                    loading={isProcessing}>
                                    Continue →
                                </Button>

                                <p className="text-center text-xs text-[hsl(var(--muted-foreground))]">
                                    🔒 Secured by PayMongo
                                </p>
                            </div>
                        )}

                        {/* --- card form --- an */}
                        {step === 'card-form' && (
                            <div className="space-y-5">
                                <CardForm onChange={setCardData} />

                                {errorMsg && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                                        {errorMsg}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => { setStep('select'); setErrorMsg(''); }}
                                        disabled={isProcessing}
                                    >
                                        ← Back
                                    </Button>
                                    <Button
                                        fullWidth
                                        loading={isProcessing}
                                        disabled={!cardData}
                                        onClick={handleCardPay}
                                    >
                                        Pay {formatPeso(amount)}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* -- ewallet redirect ---- */}
                        {step === 'ewallet' && (
                            <div className="space-y-5 text-center">
                                <div className="text-5xl">
                                    {method === 'gcash' ? '💙' : '💚'}
                                </div>
                                <div>
                                    <h4 className="font-bold text-[hsl(var(--foreground))] mb-2">
                                        Complete in {method === 'gcash' ? 'GCash' : 'Maya'}
                                    </h4>
                                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                        Click the button below to open the payment page.
                                        You'll be redirected back once complete.
                                    </p>
                                </div>

                                <Button
                                    fullWidth
                                    size="lg"
                                    onClick={() => window.open(eWalletUrl, '_blank')}
                                >
                                    Open {method === 'gcash' ? 'GCash' : 'Maya'}
                                </Button>

                                <Button
                                    variant="outline"
                                    fullWidth
                                    onClick={() => pollIntentStatus()}
                                >
                                    I've completed payment
                                </Button>

                                <Button
                                    variant="ghost"
                                    fullWidth
                                    onClick={() => { setStep('select'); setErrorMsg(''); }}
                                >
                                    Choose different method
                                </Button>

                                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                    After paying, click "I've completed payment" to confirm.
                                </p>
                            </div>
                        )}

                        {/* success / failed / processing / cancelled */}
                        {['success', 'failed', 'processing', 'cancelled'].includes(step) && (
                            <PaymentStatus
                                status={step as any}
                                amount={amount}
                                reservationId={reservationId}
                                onRetry={() => setStep('select')}
                                errorMessage={errorMsg}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* 3DS iframe modal - renders on top of payment modal */}
            {step === '3ds' && threeDsUrl && (
                <ThreeDSModal
                    url={threeDsUrl}
                    onComplete={handle3DSComplete}
                    onClose={() => {
                        
                        setThreeDsUrl('');
                        setMethod(null);
                        setErrorMsg('');
                        setIsProcessing(false);
                        setStep('cancelled')
                    }}
                />
            )}
        </>
    );
}