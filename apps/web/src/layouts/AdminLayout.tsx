import MobileDrawer from '@/components/common/MobileDrawer';
import NotificationBell from '@/components/common/NotificationBell';
import { ROUTES } from '@/constant/routes'
import { useLogout } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotification';
import { cn, getInitials } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { Bike, CalendarDays, CreditCard, LayoutDashboard, LogOut, Menu, Users, X } from 'lucide-react'
import React, { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom';


const NAV_ITEMS = [
    { to: ROUTES.ADMIN, icon: LayoutDashboard, label: 'Dashboard' },
    { to: ROUTES.ADMIN_BIKES, icon: Bike, label: 'Bikes' },
    { to: ROUTES.ADMIN_RESERVATIONS, icon: CalendarDays, label: 'Reservations' },
    { to: ROUTES.ADMIN_USERS, icon: Users, label: 'Users' },
    { to: ROUTES.ADMIN_PAYMENTS, icon: CreditCard, label: 'Payments' }
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
    const user = useAuthStore((s) => s.user);
    const { mutate: logout } = useLogout();

    return (
        <div
            className='h-full flex flex-col'
            style={{ backgroundColor: 'hsl(142, 76%, 12%' }}>
            {/* LOGO + close (mobikel only) */}
            <div className='flex items-center justify-between p-6 border-b border-white/10'>
                <Link to={ROUTES.HOME} onClick={onClose}>
                    <span className="font-bold text-xl text-white font-['Plus_Jakarta_Sans']">
                        🚲 3Jremy
                    </span>
                    <p className='text-xs text-white/60 mt-0.5'>
                        Admin Dashboard</p>
                </Link>


                {/* belll hearder */}
                <div className="flex items-center gap-2">
                    <div className="hidden lg:block">
                        <NotificationBell />
                    </div>
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
                            'flex items-center gap-3 px-3 py-2.5 rounded-xl items-sm transition-colors',
                            isActive
                                ? 'bg-white/20 text-white font-semibold'
                                : 'text-white/70 hover:bg-white/10 hover:text-white'
                        )}>
                        <Icon size={18} />
                        {label}

                    </NavLink>
                ))}
            </nav>


            {/* user + loguot */}
            <div className='p-4 border-t border-white/10'>
                <div className='flex items-center gap-3 mb-3'>
                    <div className='w-9 h-9 rounded-xl bg-[hsl(var(--accent))] flex items-center justify-center text-white text-xs font-bold shrink-0'>
                        {user ? getInitials(user.firstName, user.lastName) : 'A'}
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

const AdminLayout = () => {
    useNotifications();
    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <div className='min-h-screen flex'>

            {/* desktop sidebar - hiiden on mobile */}
            <aside className="hidden lg:flex w-64 shrink-0 flex-col sticky top-0 h-screen">
                <SidebarContent />
            </aside>

            {/* mobile drawe r*/}
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
                        🚲 3Jremy Admin
                    </span>
                    <NotificationBell />
                </header>


                {/* Page content */}
                <main className="flex-1 bg-[hsl(var(--muted))] overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default AdminLayout
