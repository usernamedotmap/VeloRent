import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import LoadingSpinner from "../common/LoadingSpinner";


export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    fullWidth?: boolean;
}

const variants = {
    primary: 'bg-[hsl(var(--primary))] text-white hover:opacity-90 shadow-sm hover:shadow-md hover:shadow-[hsl(var(--primary)/0.3)]',
    secondary: 'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:opacity-90',
    outline: 'border border-[hsl(var(--border))] bg-transparent text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]',
    ghost: 'bg-transparent text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-sm',
};

const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-5 py-2.5 text-sm rounded-xl',
    lg: 'px-7 py-3.5 text-base rounded-xl',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({
        className,
        variant = 'primary',
        size = 'md',
        loading = false,
        fullWidth = false,
        disabled,
        children,
        ...props
    }, ref) => (
        <button
            ref={ref}
            disabled={disabled || loading}
            className={cn(
                'inline-flex items-center justify-center gap-2 font-semibold transition-all',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.4)] focus:ring-offset-1',
                'hover:-translate-y-0.5 active:translate-y-0',
                variants[variant],
                sizes[size],
                fullWidth && 'w-full',
                className
            )}
            {...props}>
            {loading && <LoadingSpinner size="sm" />}
            {children}
        </button>
    )
);

Button.displayName = 'Button';
export { Button };