export const smsTemplates = {
  bookingConfirmed: (params: {
    firstName: string;
    bikeCount: number;
    slotHours: number;
    totalCost: number;
    refCode: string;
  }) => {
    return (
      `Hi ${params.firstName}! 3Jremy booking confirmed. ` +
      `${params.bikeCount} bike${params.bikeCount > 1 ? "s" : ""} | ${params.slotHours}hr | ` +
      `${params.slotHours}hr | ` +
      `₱${(params.totalCost / 100).toFixed(0)} | ` +
      `Ref: ${params.refCode.toUpperCase()}. Show ref at counter!`
    );
  },

  walkInCreated: (params: {
    firstName: string;
    bikeCount: number;
    slotHours: number;
    totalCost: number;
    refCode: string;
  }) =>
    `Hi ${params.firstName}! 3Jremy walk-in booking created. ` +
    `${params.bikeCount} bike${params.bikeCount > 1 ? "s" : ""} | ${params.slotHours}hr | ` +
    `₱${(params.totalCost / 100).toFixed(0)} | ` +
    `Ref: ${params.refCode.toUpperCase()}. Show ref at counter!`,

  rideStarted: (params: {
    firstName: string;
    bikeCount: number;
    slotHours: number;
    refCode: string;
  }) =>
    `Hi ${params.firstName}! Your 3Jremy ride has started. ` +
    `${params.bikeCount} bike${params.bikeCount > 1 ? "s" : ""} | ${params.slotHours}hr | ` +
    `Ref: ${params.refCode.toUpperCase()}. Enjoy your ride!`,

  rideWarning: (params: {
    firstName: string;
    minutesLeft: number;
    refCode: string;
  }) =>
    `Hi ${params.firstName}! 3Jremy reminder: ` +
    `your ride ends in ${params.minutesLeft} minute${params.minutesLeft !== 1 ? "s" : ""}. ` +
    `Please return your bike soon to avoid overdue charges. ` +
    `Ref: ${params.refCode.toUpperCase()}`,

  rideOverdue: (params: {
    firstName: string;
    overdueMins: number;
    overdueCost: number;
    refCode: string;
  }) =>
    `Hi ${params.firstName}! 3Jremy alert: your bike is ` +
    `${params.overdueMins} min overdue. ` +
    `Overdue charge: ₱${(params.overdueCost / 100).toFixed(0)} (paid at counter). ` +
    `Ref: ${params.refCode.toUpperCase()}`,

  rideCompleted: (params: {
    firstName: string;
    totalCost: number;
    overdueCost: number;
    refCode: string;
  }) => {
    const base = params.totalCost - params.overdueCost;
    const hasOverdue = params.overdueCost > 0;

    return hasOverdue
      ? `Hi ${params.firstName}! 3Jremy ride complete. ` +
          `Base: ₱${(base / 100).toFixed(0)} + ` +
          `Overdue: ₱${(params.overdueCost / 100).toFixed(0)} = ` +
          `Total: ₱${(params.totalCost / 100).toFixed(0)}. ` +
          `Ref: ${params.refCode.toUpperCase()}. Thanks for riding!`
      : `Hi ${params.firstName}! 3Jremy ride complete. ` +
          `Total: ₱${(params.totalCost / 100).toFixed(0)}. ` +
          `Ref: ${params.refCode.toUpperCase()}. Thanks for riding! 🚲`;
  },

  reservationCancelled: (params: {
    firstName: string;
    refCode: string;
    hasRefund: boolean;
  }) =>
    `Hi ${params.firstName}! 3Jremy reservation ` +
    `${params.refCode.toUpperCase()} has been cancelled. ` +
    (params.hasRefund
      ? "Your refund will be processed within 3-5 business days."
      : "No charges were made."),
} as const;
