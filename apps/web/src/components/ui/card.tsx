import { cn } from "@/lib/utils";


interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    hover?: boolean;
}

export function Card({ className, hover, ...props }: CardProps) {
    return (
        <div
            className={cn(
                'bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] shadow-sm',
                hover && 'hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer',
                className
            )}
            {...props}
        ></div>
    );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('p-b pb-6', className)} {...props} />;
}

export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('px-6 pb-6', className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                'px-6 py-4 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] rounded-b-2xl',
                className
            )} {...props} />
    );
}