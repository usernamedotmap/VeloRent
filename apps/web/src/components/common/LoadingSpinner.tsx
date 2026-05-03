import { cn } from '@/lib/utils';

interface Props {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    fullPage?: boolean;
}


const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
}



const LoadingSpinner = ({ size = 'md', className, fullPage }: Props) => {
    const spinner = (
        <div className={cn(
            'border-2 border-[hsl(var(--border))] border-t-[hsl(var(--primary))] rounded-full animate-spin', sizes[size], className
        )} />
    );

    if (fullPage) {
        return (
            <div className='fixed inset-0 flex items-center justify-center bg-[hsl(var(--background/0.8))] z-50'>
                {spinner}
            </div>
        )
    }
}

export default LoadingSpinner
