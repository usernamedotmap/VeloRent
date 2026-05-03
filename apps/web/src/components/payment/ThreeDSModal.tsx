import { useEffect, useRef } from "react";


interface Props {
    url: string;
    onComplete: () => void;
    onClose: () => void;
}

export default function ThreeDSModal({ url, onComplete, onClose }: Props) {
    const iFrameRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        const handler = (event: MessageEvent) => {
            if (event.data === '3DS-authentication-complete') {
                onComplete();
            }
        };

        window.addEventListener('message', handler);
        return () => window.removeEventListener('message', handler);
    }, [onComplete]);


    const handleClose = () => {
        const confirmed = window.confirm(
            'Are you sure you want to cancel 3D Secure authentication? Your payment will not be processed. '
        );
        if (confirmed) onClose();
    }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-60 flex items-center justify-center p-4">
            <div className="bg-[hsl(var(--card))] rounded-3xl overflow-hidden shadow-2xl max-w-md">

                {/* header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--border))]">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">🔒</span>
                        <div>
                            <p className="font-bold text-sm text-[hsl(var(--foreground))]">
                                3D Secure Authentication
                            </p>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                You bank requires additional verification
                            </p>
                        </div>
                    </div>

                    <button onClick={handleClose} className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] border border-[hsl(var(--border))] px-3 py-1.5 rounded-lg transition-colors">
                        Cancel
                    </button>
                </div>

                {/* iframe na dito */}
                <iframe
                    ref={iFrameRef}
                    src={url}
                    className="w-full h-96 border-0"
                    title="3D Secure Authentication"
                    sandbox="allow-forms allow-scripts allow-same-origin allow-top-navigation"
                />

                <div className="px-5 py-3 bg-[hsl(var(--muted)/0.5)] text-center text-xs text-[hsl(var(--muted-foreground))]">
                    Complete authentication in the window above
                </div>
            </div>
        </div>
    );
}