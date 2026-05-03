import { useState }          from 'react';
import { Link, NavLink }     from 'react-router-dom';
import { useAuthStore }      from '@/stores/auth.store';
import { useLogout }         from '@/hooks/useAuth';
import { cn }                from '@/lib/utils';
import {
  Bike, Sun, Moon, Leaf,
  Menu, X, LayoutDashboard, LogOut, User,
}                            from 'lucide-react';
import MobileDrawer          from './MobileDrawer';
import { ROUTES } from '@/constant/routes';

export default function Navbar() {
  const user               = useAuthStore((s) => s.user);
  const theme              = useAuthStore((s) => s.theme);
  const setTheme           = useAuthStore((s) => s.setTheme);
  const { mutate: logout } = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);

  const themes = [
    { key: 'green' as const, icon: Leaf,  label: 'Green' },
    { key: 'light' as const, icon: Sun,   label: 'Light' },
    { key: 'dark'  as const, icon: Moon,  label: 'Dark'  },
  ];

  const getDashboardRoute = () => {
    if (!user) return ROUTES.LOGIN;
    if (user.role === 'admin')    return ROUTES.ADMIN;
    if (user.role === 'operator') return ROUTES.OPERATOR;
    return ROUTES.DASHBOARD;
  };

  return (
    <header className="sticky top-0 z-50 bg-[hsl(var(--card))] border-b border-[hsl(var(--border))] shadow-sm">
      <nav className="container mx-auto px-4 max-w-6xl h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link
          to={ROUTES.HOME}
          className="flex items-center gap-2 font-bold text-xl text-[hsl(var(--primary))] font-['Plus_Jakarta_Sans'] shrink-0"
        >
          <Bike size={22} />
          <span className="hidden sm:inline">VeloRent</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 flex-1">
          <NavLink
            to={ROUTES.BIKES}
            className={({ isActive }) => cn(
              'text-sm font-medium transition-colors',
              isActive
                ? 'text-[hsl(var(--primary))]'
                : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
            )}
          >
            Browse Bikes
          </NavLink>
        </div>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme switcher */}
          <div className="flex items-center bg-[hsl(var(--muted))] rounded-lg p-1">
            {themes.map(({ key, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTheme(key)}
                className={cn(
                  'p-1.5 rounded-md transition-colors',
                  theme === key
                    ? 'bg-[hsl(var(--primary))] text-white'
                    : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                )}
              >
                <Icon size={14} />
              </button>
            ))}
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to={getDashboardRoute()}
                className="text-sm font-semibold text-[hsl(var(--primary))] hover:underline"
              >
                {user.firstName}
              </Link>
              <button
                onClick={() => logout()}
                className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to={ROUTES.LOGIN}
                className="text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
              >
                Sign in
              </Link>
              <Link
                to={ROUTES.REGISTER}
                className="text-sm font-semibold bg-[hsl(var(--primary))] text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
              >
                Get started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(true)}
          className="md:hidden text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors p-1"
        >
          <Menu size={22} />
        </button>
      </nav>

      {/* Mobile drawer */}
      <MobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)}>
        <div className="h-full flex flex-col bg-[hsl(var(--card))]">

          {/* Drawer header */}
          <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))]">
            <Link
              to={ROUTES.HOME}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 font-bold text-xl text-[hsl(var(--primary))] font-['Plus_Jakarta_Sans']"
            >
              <Bike size={22} />
              VeloRent
            </Link>
            <button
              onClick={() => setMenuOpen(false)}
              className="text-[hsl(var(--muted-foreground))]"
            >
              <X size={22} />
            </button>
          </div>

          {/* Drawer nav */}
          <nav className="flex-1 p-5 space-y-2">
            <Link
              to={ROUTES.BIKES}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
            >
              <Bike size={18} className="text-[hsl(var(--primary))]" />
              Browse Bikes
            </Link>

            {user && (
              <Link
                to={getDashboardRoute()}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
              >
                <LayoutDashboard size={18} className="text-[hsl(var(--primary))]" />
                Dashboard
              </Link>
            )}
          </nav>

          {/* Theme switcher */}
          <div className="px-5 py-4 border-t border-[hsl(var(--border))]">
            <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-3">
              Theme
            </p>
            <div className="flex gap-2">
              {themes.map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() => setTheme(key)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all border',
                    theme === key
                      ? 'bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))]'
                      : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))]'
                  )}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Auth actions */}
          <div className="p-5 border-t border-[hsl(var(--border))]">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-9 h-9 rounded-xl bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] flex items-center justify-center text-xs font-bold">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      {user.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  to={ROUTES.LOGIN}
                  onClick={() => setMenuOpen(false)}
                  className="block w-full text-center py-3 rounded-xl text-sm font-semibold border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  onClick={() => setMenuOpen(false)}
                  className="block w-full text-center py-3 rounded-xl text-sm font-semibold bg-[hsl(var(--primary))] text-white hover:opacity-90 transition-opacity"
                >
                  Get started free
                </Link>
              </div>
            )}
          </div>
        </div>
      </MobileDrawer>
    </header>
  );
}