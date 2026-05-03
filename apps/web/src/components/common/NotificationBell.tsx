import { ROUTES } from "@/constant/routes";
import { useMarkAllRead, useMarkOneRead } from "@/hooks/useNotification";
import { cn, formatDate } from "@/lib/utils";
import { useNotificationStore } from "@/stores/notification.store";
import { NOTIFICATION_CONFIG } from "@/types/notification.types";
import { Bell, Check } from "lucide-react";
import { EventHandler, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const formatRelativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
}

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const notifications = useNotificationStore((s) => s.notifications);
    const unreadCount = useNotificationStore((s) => s.unreadCount);
    const isLoading = useNotificationStore((s) => s.isLoading);

    const { mutate: markOneRead } = useMarkOneRead();
    const { mutate: markAllRead } = useMarkAllRead();

    // close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && open) setOpen(false);
        }
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open]);

    useEffect(() => {
        if (!open) {
            document.body.style.overflow = "";
            return;
        }
        // only lock sa samll sizes
        const isMobile = window.matchMedia("(max-width: 639px)").matches;
        if (isMobile) document.body.style.overflow = "hidden"
        return () => { document.body.style.overflow = ""; }
    }, [open]);


    const handleNotificationClick = (notif: typeof notifications[0]) => {
        if (!notif.isRead) markOneRead(notif._id);
        setOpen(false);
        if (notif.reservationId) {
            console.log(notif.reservationId, "ano kaya to");
            navigate(ROUTES.RESERVATION(notif.reservationId));
        }
    };

    return (
        <div className="relative" ref={panelRef}>

            {/* bell */}
            <button
                onClick={() => setOpen((p) => !p)}
                className="relative p-2 rounded-xl hover:bg-white/10 transition-colors"
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}`}>
                <Bell size={20} className="text-white/80" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-in zoom-in-50">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* overlay for mobile */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 sm:hidden"
                    onClick={() => setOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* drowopdown */}
            {open && (
                <div
                    ref={panelRef}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Notifications"
                    className={cn(
                        // mb view
                        "fixed inset-x-0 top-0 z-50 sm:absolute sm:right-0  sm:top-full sm:mt-2",
                        "sm:w-96 w-full",
                        "bg-[hsl(var(--card))] sm:rounded-2xl rounded-b-2xl sm:border sm:border-[hsl(var(--border))] shadow-2xl overflow-hidden",
                        "transform-gpu animate-in fade-in-0 duration-200"
                    )}
                    style={{ maxHeight: "80vh" }}>

                    {/* header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--border))]">
                        <div className="flex items-center gap-2">
                            <Bell size={15} className="text-[hsl(var(--primary))]" />
                            <h3 className="font-bold text-sm text-[hsl(var(--foreground))]">
                                Notifications
                            </h3>
                            {unreadCount > 0 && (
                                <span className="text-xs bg-[hsl(var(--primary/0.1))] text-[hsl(var(--primary))] font-semibold px-2 py-0.5 rounded-full">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => markAllRead()}
                                    className="flex items-center gap-1 text-xs text-[hsl(var(--primary))] hover:underline font-semibold">
                                    <Check size={12} />
                                    <span className="hidden sm:inline">Mark all read</span>
                                    <span className="sm:hidden text-[12px]">Mark all</span>
                                </button>
                            )}

                            <button
                                onClick={() => setOpen(false)}
                                aria-label="Close notitifications"
                                className="p-2 rounded-md hover:bg-[hsl(var(--muted)/0.06)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]">
                                <svg
                                    className="w-4 h-4 text-[hsl(var(--muted-foreground))]"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>



                    {/* list */}
                    <div className=" overflow-y-auto divide-y divide-[hsl(var(--border))] touch-pan-y"
                        style={{ WebkitOverflowScrolling: "touch", maxHeight: "calc(80vh - 64px)", }}>
                        {isLoading ? (
                            <div className="py-8 space-y-3 px-4">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="flex gap-3 animate-pulse">
                                        <div className="w-9 h-9 bg-[hsl(var(--muted))] rounded-xl shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-3 bg-[hsl(var(--muted))] rounded w-3/4" />
                                            <div className="h-2 bg-[hsl(var(--muted))] rounded w-full" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-12 text-center">
                                <div className="text-4xl mb-2">🔔</div>
                                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                    No notification yet
                                </p>
                                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                                    Real-time alerts appear here
                                </p>
                            </div>
                        ) : (
                            notifications.map((notif) => {
                                const config = NOTIFICATION_CONFIG[notif.event];
                                return (
                                    <button
                                        key={notif._id}
                                        onClick={() => handleNotificationClick(notif)}
                                        className={cn(
                                            'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[hsl(var(--muted)/0.5)]',
                                            !notif.isRead && 'bg-[hsl(var(--primary)/0.04)]'
                                        )}>
                                        <div className={cn(
                                            'w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 mt-0.5',
                                            config.bg
                                        )}>
                                            {config.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={cn(
                                                    'text-sm text-[hsl(var(--foreground))] leading-tight',
                                                    notif.isRead ? 'font-medium' : 'font-bold'
                                                )}>
                                                    {notif.title}
                                                </p>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <span className="text-[10px] text-[hsl(var(--muted-foreground))] whitespace-nowrap">
                                                        {formatRelativeTime(notif.createdAt)}
                                                    </span>
                                                    {!notif.isRead && (
                                                        <div className="w-2 h-2 bg-[hsl(var(--primary))] rounded-full" />
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5 leading-relaxed line-clamp-2">
                                                {notif.message}
                                            </p>
                                        </div>
                                    </button>
                                )
                            })
                        )}
                    </div>

                    {/* mobiele footer actions */}
                    <div className="sm:hidden border-t border-[hsl(var(--border))] px-4 py-3 bg-[hsl(var(--card))]">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => markAllRead()}
                                className="flex-1 text-sm text-[hsl(var(--primary))] font-semibold py-2 rounded-md">
                                Mark all read
                            </button>
                        </div>
                    </div>

                    {/* footer */}
                    {notifications.length > 0 && (
                        <div className="px-4 py-2.5 border-t border-[hsl(var(--border))] text-center">
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                Showing last {notifications.length} notifications
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )


}