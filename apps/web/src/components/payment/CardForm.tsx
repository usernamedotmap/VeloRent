import { CreditCard, Lock } from "lucide-react";
import { useState } from "react";
import { Input } from "../ui/input";



export interface CardData {
    cardNumber: string;
    expMonth: number;
    expYear: number;
    cvc: string;
    name: string;
}


interface Props {
    onChange: (data: CardData | null) => void;
}

// format card number wtih space
const formatCardNumber = (value: string) =>
    value.replace(/\D/g, '')
        .slice(0, 16)
        .replace(/(.{4})/g, '$1')
        .trim();


//ffomat expiry
const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
};

export default function CardForm({ onChange }: Props) {
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [name, setName] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = (
        cn: string, ex: string, cv: string, nm: string
    ): boolean => {
        const errs: Record<string, string> = {};

        if (cn.replace(/\s/g, '').length < 16) {
            errs.cardNumber = 'Enter a valid 16-digit card number';
        }

        const parts = ex.split('/');
        if (parts.length !== 2 || parts[0].length !== 2 || parts[1].length !== 2) {
            errs.expiry = 'Enter expiry as MM/YY';
        } else {
            const month = parseInt(parts[0]);
            const year = parseInt(`20${parts[1]}`);
            const now = new Date();
            if (month < 1 || month > 12) {
                errs.expiry = 'Invalid month';
            } else if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
                errs.expiry = 'Card is expired';
            }
        }

        if (cv.length < 3) errs.cvc = 'Enter a valid CVC';
        if (!nm.trim()) errs.name = 'Enter the name on card';

        setErrors(errs);

        if (Object.keys(errs).length === 0) {
            const [m, y] = ex.split('/');
            onChange({
                cardNumber: cn.replace(/\s/g, ''),
                expMonth: parseInt(m),
                expYear: parseInt(`20${y}`),
                cvc: cv,
                name: nm,
            });
            return true;
        }

        onChange(null);
        return false;
    };

    const handleCardNumber = (val: string) => {
        const formatted = formatCardNumber(val);
        setCardNumber(formatted);
        validate(formatted, expiry, cvc, name);
    };

    const handleExpiry = (val: string) => {
        const formatted = formatExpiry(val);
        setExpiry(formatted);
        validate(cardNumber, formatted, cvc, name);
    };

    const handleCvc = (val: string) => {
        const v = val.replace(/\D/g, '').slice(0, 4);
        setCvc(v);
        validate(cardNumber, expiry, v, name);
    };

    const handleName = (val: string) => {
        setName(val);
        validate(cardNumber, expiry, cvc, val);
    };


    return (
        <div className="space-y-4">

            {/* security nnote */}
            <div className="flex items-center gap-2 bg-[hsl(var(--muted))] rounded-xl px-3 py-2 text-xs text-[hsl(var(--muted-foreground))]">
                <Lock size={12} className="text-[hsl(var(--primary))] shrink-0" />
                Your card details are sent directly to PayMongo and never stored on our servers.
            </div>

            {/* Card number */}
            <Input
                label="Card number"
                placeholder="4343 4343 4343 4343"
                value={cardNumber}
                onChange={(e) => handleCardNumber(e.target.value)}
                error={errors.cardNumber}
                inputMode="numeric"
                maxLength={19}
            />

            {/* expiry + cvc */}
            <div className="grid grid-cols-2 gap-3">
                <Input
                    label="Expiry"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => handleExpiry(e.target.value)}
                    error={errors.expiry}
                    inputMode="numeric"
                    maxLength={5}

                />
                <Input
                    label="CVC"
                    placeholder="123"
                    value={cvc}
                    onChange={(e) => handleCvc(e.target.value)}
                    error={errors.cvc}
                    inputMode="numeric"
                    maxLength={4}
                    type="password"
                />
            </div>

            <Input
                label="Name on card"
                placeholder="Romualzdex"
                value={name}
                onChange={(e) => handleName(e.target.value)}
                error={errors.name}
                autoComplete="cc-name"
            />

            {/* card type icon */}
            <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                <CreditCard size={14} />
                <span>We accept Visa and Mastercard</span>
                <div className="flex gap-1.5 ml-auto">
                    {['VISA', 'MC'].map((c) => (
                        <span
                            key={c}
                            className="px-2 py-0.5 rounded text-xs font-bold bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">
                            {c}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )
}
