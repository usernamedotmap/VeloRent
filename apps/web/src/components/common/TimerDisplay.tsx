import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";


interface Props {
    startedAt: string;
    slotSeconds: number;
    isOverdue?: boolean;
}

const pad = (n: number) => String(n).padStart(2, '0');

const formatSeconds = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return h > 0
        ? `${pad(h)}:${pad(m)}:${pad(s)}`
        : `${pad(m)}:${pad(s)}`;
};

export default function TimerDisplay({ startedAt, slotSeconds, isOverdue }: Props) {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const calc = () => {
            const secs = Math.floor(
                (Date.now() - new Date(startedAt).getTime()) / 1000
            );
            setElapsed(secs);
        };
        calc();
        const interval = setInterval(calc, 1000);
        return () => clearInterval(interval);
    }, [startedAt]);

    const remaining = slotSeconds - elapsed;
    const isOver = remaining <= 0;
    const displaySecs = isOver ? Math.abs(remaining) : remaining;
    const isWarning = !isOver && remaining <= 900; // 15 minutes to ah

    return (
        <div className="text-center">
            {/* timer */}
            <div className={cn(
                'font-mono text-2xl font-extrabold tabular-nums',
                isOver ? 'text-red-500' :
                    isWarning ? 'text-amber-500' :
                        'text-[hsl(var(--primary))]'
            )}>
                {isOver && <span className="text-sm mr-1">+</span>}
                {formatSeconds(displaySecs)}
            </div>

            {/* label */}
            <div className={cn(
                'text-xs font-semibold mt-0.5',
                isOver ? 'text-red-400' :
                    isWarning ? 'text-amber-400' :
                        'text-[hsl(var(--muted-foreground))]'
            )}>
                {isOver ? 'OVERDDUE' :
                    isWarning ? 'Almost up!' :
                        'Time Remaining'}
            </div>
        </div>
    );

}