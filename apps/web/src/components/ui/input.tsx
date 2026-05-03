import { cn } from "@/lib/utils";
import { forwardRef } from "react";


export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
    label?: string;
    hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, error, label, hint, id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="w-full space-y-1.5">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-semibold text-[hsl(var(--foreground))]">
                        {label}
                        {props.required && (
                            <span className="text-red-500 ml-1">*</span>
                        )}
                    </label>
                )}
                <input
                    id={inputId}
                    ref={ref}
                    className={cn(
                        'w-full px-4 py-2.5 rounded-xl border bg-[hsl(var(--card))] text-[hsl(var(--foreground))]',
                        'text-sm placeholder:text-[hsl(var(--muted-foreground))]',
                        'transition-all outline-none',
                        'focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)] focus:border-[hsl(var(--primary))]',
                        error
                            ? 'border-red-400 focus:ring-red-200 focus:border-red-500'
                            : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)]',
                        className
                    )}
                    {...props}
                />
                {hint && !error && (
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">{hint}</p>
                )}
                {error && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                        <span>⚠</span> {error}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
export { Input };