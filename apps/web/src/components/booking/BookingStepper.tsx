import { cn } from "@/lib/utils";
import { Check } from "lucide-react";



interface Step {
    number: number;
    label: string;
    icon: string;
}

const steps: Step[] = [
    { number: 1, label: 'Select Bikes', icon: '🚲' },
    { number: 2, label: 'Choose Slot', icon: '🕐' },
    { number: 3, label: 'Review', icon: '📋' },
    { number: 4, label: 'Payment', icon: '💳' },
];


interface Props {
    currentStep: number;
}

export default function BookingStepper({ currentStep }: Props) {
    return (
        <div className="w-full">
            <div className="flex items-center justify-between relative">

                {/* connector line */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[hsl(var(--border))] -z-0 -translate-y-1/2" />
                <div className="absolute top-1/2 left-0 h-0.5 bg-[hsl(var(--primary))] transition-all duration-500 -z-0 -translate-y-1/2"
                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }} />


                {steps.map(({ number, label, icon }) => {
                    const isDone = currentStep > number;
                    const isActive = currentStep === number;

                    return (
                        <div key={number} className="flex flex-col items-center gap-2 relative z-10">
                            {/* circle */}
                            <div className={cn(
                                'w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all border-2', isDone
                                ? 'bg-[hsl(var(--primary))] border-[hsl(var(--primary))] text-white'
                                : isActive
                                    ? 'bg-[hsl(var(--card))] border-[hsl(var(--primary))] text-[hsl(var(--primary))] shadow-md shadow-[hsl(var(--primary)/0.2)]'
                                    : 'bg-[hsl(var(--card))] border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]'
                            )}>
                                {isDone ? <Check size={20} /> : <span className="text-2xl">{icon}</span>}   
                            </div>

                            {/* label */}
                            <span className={cn(
                                'text-xs font-semibold hidden sm:block',
                                isActive ? 'text-[hsl(var(--primary))]' : '',
                                isDone ? 'text-[hsl(var(--primary)/0.7)]' : '',
                                !isActive && !isDone ? 'text-[hsl(var(--muted-foreground))]' : ''
                            )}>
                                {label}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}