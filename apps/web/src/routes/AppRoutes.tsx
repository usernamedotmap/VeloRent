import PublicLayout from "@/layouts/PublicLayout";
import LoginPage from "@/pages/auth/LoginPage";
import BikeDetailPage from "@/pages/public/BikeDetailPage";
import BikesPage from "@/pages/public/BikesPage";
import LandingPage from "@/pages/public/LandingPage";
import { Route, Routes } from "react-router-dom";
import { GuestOnly, RequireAuth } from "./ProtectedRoute";
import RegisterPage from "@/pages/auth/RegisterPage";
import CustomerLayout from "@/layouts/CustomerLayout";
import CustomerDashboard from "@/pages/customer/DashboardPage";
import NewReservationPage from "@/pages/customer/NewReservationPage";
import ReservationDetailPage from "@/pages/customer/ReservationDetailPage";
import ProfilePage from "@/pages/customer/ProfilePage";
import OperatorLayout from "@/layouts/OperatorLayout";
import OperatorDashboard from "@/pages/operator/DashboardPage";
import WalkInPage from "@/pages/operator/WalkInPage";
import ActiveRidesPage from "@/pages/operator/ActiveRidesPage";
import AdminDashboard from "@/pages/admin/DashboardPage";
import AdminBikesPage from "@/pages/admin/BikesPage";
import AdminReservationPage from "@/pages/admin/ReservationsPage";
import AdminUsersPage from "@/pages/admin/UsersPage";
import AdminPaymentPage from "@/pages/admin/PaymentPage";
import AdminLayout from "@/layouts/AdminLayout";
import AdminReservationDetailPage from "@/pages/admin/AdminReservationDetailPage";


export function AppRoutes() {
    return (
        <Routes>
            {/* public route */}f
            <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/bikes" element={<BikesPage />} />
                <Route path="/bikes/:id" element={<BikeDetailPage />} />
            </Route>

            {/* aiuth route */}
            <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
            <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />

            {/* customer route */}
            <Route element={<RequireAuth roles={['customer']}><CustomerLayout /></RequireAuth>}>
                <Route path="/dashboard" element={<CustomerDashboard />} />
                <Route path="/reservation/new" element={<NewReservationPage />} />
                <Route path="/reservations/:id" element={<ReservationDetailPage />} />
                <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* operator route */}
            <Route element={<RequireAuth roles={['operator']}><OperatorLayout /></RequireAuth>}>
                <Route path="/operator" element={<OperatorDashboard />} />
                <Route path="/operator/walk-in" element={<WalkInPage />} />
                <Route path="/operator/rides" element={<ActiveRidesPage />} />
            </Route>

            <Route element={<RequireAuth roles={['admin']}>
                <AdminLayout />
            </RequireAuth>}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/bikes" element={<AdminBikesPage />} />
                <Route path="/admin/reservations" element={<AdminReservationPage />} />
                <Route path="/admin/reservation/:id" element={<AdminReservationDetailPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/payments" element={<AdminPaymentPage />} /></Route>

            <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
    );
}