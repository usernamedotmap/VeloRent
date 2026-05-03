import { ROUTES } from "@/constant/routes";
import { useMe } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/auth.store";
import { Navigate, useSearchParams } from "react-router-dom";



export const RequireAuth = ({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: string[];
}) => {
  const user = useAuthStore((s) => s.user);
  const { isLoading } = useMe(); // ← check if auth is still loading

  // Still determining auth state — don't redirect yet
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[hsl(var(--border))] border-t-[hsl(var(--primary))] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const GuestOnly = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthStore((s) => s.user);
  const [searchParams] = useSearchParams();

  const hasRedirect = searchParams.get('redirect');

  if (user && !hasRedirect) {
    return <Navigate to={ROUTES.HOME} replace />
  }
  return <>{children}</>
};

