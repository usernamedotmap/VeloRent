import MobileDrawer from '@/components/common/MobileDrawer';
import NotificationBell from '@/components/common/NotificationBell';
import { ROUTES } from '@/constant/routes'
import { useLogout } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotification';
import { cn, getInitials } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { Bike, LayoutDashboard, LogOut, Menu, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';

const NAV_ITEMS = [
    { to: ROUTES.OPERATOR, icon: LayoutDashboard, label: 'Dashboard' },
    { to: ROUTES.OPERATOR_WALKIN, icon: Plus, label: 'Walk-in' },
    { to: ROUTES.OPERATOR_RIDES, icon: Bike, label: 'Active Rides' },
];

const BOTTOM_NAV = [
    { to: ROUTES.OPERATOR, icon: LayoutDashboard, label: 'Dashboard' },
    { to: ROUTES.OPERATOR_WALKIN, icon: Plus, label: 'Walk-in' },
    { to: ROUTES.OPERATOR_RIDES, icon: Bike, label: 'Rides' },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
    const user = useAuthStore((s) => s.user);
    const { mutate: logout } = useLogout();

    return (
        <div
            className='h-full flex flex-col'
            style={{ backgroundColor: 'hsl(142, 76%, 12%' }}>
            {/* LOGO + close (mobile only) */}
            <div className='flex items-center justify-between p-6 border-b border-white/10'>
                <Link to={ROUTES.OPERATOR} onClick={onClose}>
                    <span className="font-bold text-xl text-white font-['Plus_Jakarta_Sans']">
                        🚲 VeloRent
                    </span>
                    <p className='text-xs text-white/60 mt-0.5'>
                        Operator Panel</p>
                </Link>

                {/* bell hereader */}
                <div className='flex items-center gap-2'>
                    <NotificationBell />
                    {onClose && (
                        <button onClick={onClose}
                            className="text-white/60 hover:text-white transition-colors lg:hidden">
                            <X size={20} />
                        </button>
                    )}
                </div>
            </div>

            {/* nav */}
            <nav className='flex-1 p-4 space-y-1 overflow-y-auto'>
                {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end
                        onClick={onClose}
                        className={({ isActive }) => cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors',
                            isActive
                                ? 'bg-white/20 text-white font-semibold'
                                : 'text-white/70 hover:bg-white/10 hover:text-white'
                        )}>
                        <Icon size={18} />
                        {label}

                    </NavLink>
                ))}
            </nav>

            {/* user + logout */}
            <div className='p-4 border-t border-white/10'>
                <div className='flex items-center gap-3 mb-3'>
                    <div className='w-9 h-9 rounded-xl bg-[hsl(var(--accent))] flex items-center justify-center text-white text-xs font-bold shrink-0'>
                        {user ? getInitials(user.firstName, user.lastName) : 'O'}
                    </div>
                    <div className='min-w-0'>
                        <p className='text-sm font-semibold text-white truncate'>
                            {user?.firstName} {user?.lastName}
                        </p>
                        <p className='text-xs text-white/60 truncate'>{user?.email}</p>
                    </div>
                </div>

                <button
                    onClick={() => { logout(); onClose?.() }}
                    className="w-full flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10">

                    <LogOut size={15} />
                    Sign Out
                </button>
            </div>
        </div >
    );
}

const OperatorLayout = () => {
    useNotifications();
    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <div className='min-h-screen flex'>

            {/* desktop sidebar - hidden on mobile */}
            <aside className="hidden lg:flex w-64 shrink-0 flex-col sticky top-0 h-screen">
                <SidebarContent />
            </aside>

            {/* mobile drawer */}
            <MobileDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}>
                <SidebarContent onClose={() => setDrawerOpen(false)} />
            </MobileDrawer>

            {/* main content */}
            <div className='flex-1 flex flex-col min-w-0'>

                {/* mobile topbar */}
                <header className='lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-[hsl(var(--card))] border-b border-[hsl(var(--border))]'
                    style={{ backgroundColor: 'hsl(142, 76%, 12%' }}>
                    <button
                        onClick={() => setDrawerOpen(true)}
                        className='text-white p-1'>
                        <Menu size={22} />
                    </button>
                    <span className="text-white font-bold font-['Plus_Jakarta_Sans']">
                        🚲 VeloRent Operator
                    </span>
                    <NotificationBell />
                </header>

                {/* Page content */}
                <main className="flex-1 bg-[hsl(var(--muted))] overflow-auto p-4 pb-16 lg:pb-0 lg:p-5">
                    <Outlet />
                </main>

                {/* mobile bottom nav */}
                <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[hsl(var(--card))] border-t border-[hsl(var(--border))] flex">
                    {BOTTOM_NAV.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            to={to}
                            key={to}
                            end
                            className={({ isActive }) => cn(
                                'flex-1 flex flex-col items-center justify-center py-3 gap-1 text-xs font-semibold transition-colors',
                                isActive
                                    ? 'text-[hsl(var(--primary))]'
                                    : 'text-[hsl(var(--muted-foreground))]'
                            )}>
                            {({ isActive }) => (
                                <>
                                    <div className={cn(
                                        'p-1.5 rounded-xl transition-colors',
                                        isActive && 'bg-[hsl(var(--primary)/0.1)]'
                                    )}>
                                        <Icon size={20} />
                                    </div>
                                    {label}
                                </>
                            )}
                        </NavLink>
                    ))}

                    {/* opens drawer */}
                    <button
                        onClick={() => setDrawerOpen(true)}
                        className='flex-1 flex flex-col items-center justify-center py-3 gap-1 text-xs font-semibold text-[hsl(var(--muted-foreground))]'>
                        <div className='p-1.5 rounded-xl'>
                            <Menu size={20} />
                        </div>
                        More
                    </button>
                </nav>
            </div>
        </div>
    );
}

export default OperatorLayout;
