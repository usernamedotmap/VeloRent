import { cn } from "@/lib/utils";
import { useEffect } from "react";


interface Props  {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
}

export default function MobileDrawer({open, onClose, children, title}: Props) {
// body scrool when the mobile view is naka open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = '' ;}
    }, [open]);

    return (
        <>
        {/* backdrop */}
        <div
        className={cn(
            'fixed inset-0 bg-black/50 backdrop:blur-sm z-40 transition-opacity duration-300',
            open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}>

            {/* drawer */}
            <div className={cn(
                'fixed top-0 left-0 h-full w-72 z-50 transition-transform duration-300 ease-in-out',
                open ? 'translate-x-0' : '-translate-x-full'
            )}>
                {children}
            </div>
        </div>
        </>
    )

}