export const ROUTES = {
  // public
  HOME: "/",
  BIKES: "/bikes",
  BIKE_DETAIL: (id: string) => `/bikes/${id}`,

  // auth
  LOGIN: "/login",
  REGISTER: "/register",

  // customer
  DASHBOARD: "/dashboard",
  RESERVATION_NEW: "/reservation/new",
  RESERVATION: (id: string) => `/reservations/${id}`,
  PROFILE: "/profile",

  // operator
  OPERATOR: "/operator",
  OPERATOR_WALKIN: "/operator/walk-in",
  OPERATOR_RIDES: "/operator/rides",

  // admin
  ADMIN: "/admin",
  ADMIN_BIKES: "/admin/bikes",
  ADMIN_RESERVATIONS: "/admin/reservations",
  ADMIN_RESERVATION: (id: string) => `/admin/reservation/${id}`,
  ADMIN_USERS: "/admin/users",
  ADMIN_PAYMENTS: "/admin/payments",
} as const;
