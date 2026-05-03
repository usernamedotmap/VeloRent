export const QUERY_KEYS = {
  // auth
  ME: ["auth", "me"],

  // bikes
  BIKES: (filters?: Record<string, unknown>) => ["bikes", filters],
  BIKE: (id: string) => ["bikes", id],

  // reservations
  RESERVATIONS: (filters?: Record<string, unknown>) => [
    "reservations",
    filters,
  ],
  MY_RESERVATIONS: (filters?: Record<string, unknown>) => [
    "reservations",
    "me",
    filters,
  ],
  RESERVATION: (id: string) => ["reservations", id],

  // apyemnts
  PAYMENT: (reservationId: string) => ["payments", reservationId],

  // admin
  USERS: (filters?: Record<string, unknown>) => ["users", filters],
} as const;
