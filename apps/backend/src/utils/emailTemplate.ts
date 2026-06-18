
// Base layout wrapper
const baseTemplate = (content: string, title: string): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: #166534; padding: 24px 32px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
    .header p { color: #bbf7d0; margin: 4px 0 0; font-size: 14px; }
    .body { padding: 32px; }
    .body h2 { color: #166534; margin-top: 0; }
    .detail-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .detail-table td { padding: 10px 0; border-bottom: 1px solid #f0f0f0; vertical-align: top; }
    .detail-label { color: #666; font-size: 14px; }
    .detail-value { font-weight: bold; font-size: 14px; color: #222; text-align: right; white-space: nowrap; }
    .total-table { width: 100%; border-collapse: collapse; margin-top: 24px; }
    .total-table td { padding: 14px 0; }
    .total-label { font-size: 16px; font-weight: bold; color: #222; }
    .total-value { font-size: 20px; font-weight: bold; color: #166534; text-align: right; }
    .ref-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0; }
    .ref-code { font-size: 24px; font-weight: bold; color: #166534; letter-spacing: 4px; font-family: monospace; }
    .footer { background: #f9fafb; padding: 20px 32px; text-align: center; }
    .footer p { color: #999; font-size: 12px; margin: 4px 0; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
    .badge-success { background: #dcfce7; color: #166534; }
    .badge-warning { background: #fef9c3; color: #854d0e; }
    .badge-danger  { background: #fee2e2; color: #991b1b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚲 3Jremy</h1>
      <p>Smart Bicycle Rental System</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>3Jremy Bike Rental • Questions? Reply to this email.</p>
      <p>This is an automated message — please do not reply directly.</p>
    </div>
  </div>
</body>
</html>
`;

// ─── Booking Confirmed ────────────────────────────────────────
export const bookingConfirmedEmail = (params: {
  firstName:    string;
  refCode:      string;
  bikeCount:    number;
  slotHours:    number;
  scheduledStart: string;
  totalCost:    number;
}) => ({
  subject: `✅ Booking Confirmed — Ref: ${params.refCode}`,
  html: baseTemplate(`
    <h2>Booking Confirmed! 🎉</h2>
    <p>Hi <strong>${params.firstName}</strong>,</p>
    <p>Your 3Jremy reservation has been confirmed. Show your reference code at the counter.</p>

    <div class="ref-box">
      <p style="margin:0 0 4px; color:#666; font-size:13px;">Reference Code</p>
      <div class="ref-code">${params.refCode}</div>
    </div>

    <table class="detail-table" role="presentation">
      <tr>
        <td class="detail-label">Bikes</td>
        <td class="detail-value">${params.bikeCount} bike${params.bikeCount > 1 ? 's' : ''}</td>
      </tr>
      <tr>
        <td class="detail-label">Duration</td>
        <td class="detail-value">${params.slotHours} hour${params.slotHours > 1 ? 's' : ''}</td>
      </tr>
      <tr>
        <td class="detail-label">Scheduled Start</td>
        <td class="detail-value">${params.scheduledStart}</td>
      </tr>
    </table>
    <table class="total-table" role="presentation">
      <tr>
        <td class="total-label">Total Paid</td>
        <td class="total-value">₱${(params.totalCost / 100).toFixed(2)}</td>
      </tr>
    </table>

    <p style="margin-top:24px; color:#555; font-size:14px;">
      ⚠️ Overdue charges: ₱50 per 15 minutes past your slot per bike, settled at the counter.
    </p>
  `, 'Booking Confirmed — 3Jremy'),
});

// ─── Ride Started ─────────────────────────────────────────────
export const rideStartedEmail = (params: {
  firstName: string;
  refCode:   string;
  bikeCount: number;
  slotHours: number;
}) => ({
  subject: `🚴 Your Ride Has Started — Ref: ${params.refCode}`,
  html: baseTemplate(`
    <h2>Your Ride Has Started! 🚴</h2>
    <p>Hi <strong>${params.firstName}</strong>,</p>
    <p>Your bike rental has officially started. Enjoy your ride!</p>

    <div class="ref-box">
      <div class="ref-code">${params.refCode}</div>
    </div>

    <table class="detail-table" role="presentation">
      <tr>
        <td class="detail-label">Bikes</td>
        <td class="detail-value">${params.bikeCount}</td>
      </tr>
      <tr>
        <td class="detail-label">Slot Duration</td>
        <td class="detail-value">${params.slotHours} hour${params.slotHours > 1 ? 's' : ''}</td>
      </tr>
    </table>

    <p style="margin-top:24px; color:#555;">
      ⏰ Please return your bike on time to avoid overdue charges.
    </p>
  `, 'Ride Started — 3Jremy'),
});

// ─── Ride Completed ───────────────────────────────────────────
export const rideCompletedEmail = (params: {
  firstName:   string;
  refCode:     string;
  totalCost:   number;
  overdueCost: number;
}) => ({
  subject: `🏁 Ride Complete — Ref: ${params.refCode}`,
  html: baseTemplate(`
    <h2>Ride Complete! 🏁</h2>
    <p>Hi <strong>${params.firstName}</strong>,</p>
    <p>Thank you for riding with 3Jremy. Here's your summary:</p>

    <div class="ref-box">
      <div class="ref-code">${params.refCode}</div>
    </div>

    <table class="detail-table" role="presentation">
      <tr>
        <td class="detail-label">Base Cost</td>
        <td class="detail-value">₱${((params.totalCost - params.overdueCost) / 100).toFixed(2)}</td>
      </tr>
      ${params.overdueCost > 0 ? `
      <tr>
        <td class="detail-label">Overdue Charges</td>
        <td class="detail-value" style="color:#dc2626;">+₱${(params.overdueCost / 100).toFixed(2)}</td>
      </tr>
      ` : ''}
    </table>
    <table class="total-table" role="presentation">
      <tr>
        <td class="total-label">Total</td>
        <td class="total-value">₱${(params.totalCost / 100).toFixed(2)}</td>
      </tr>
    </table>

    <p style="margin-top:24px; color:#555;">
      🚲 Thanks for choosing 3Jremy. We hope to see you again!
    </p>
  `, 'Ride Complete — 3Jremy'),
});

// ─── Reservation Cancelled ────────────────────────────────────
export const cancellationEmail = (params: {
  firstName: string;
  refCode:   string;
  hasRefund: boolean;
}) => ({
  subject: `❌ Reservation Cancelled — Ref: ${params.refCode}`,
  html: baseTemplate(`
    <h2>Reservation Cancelled</h2>
    <p>Hi <strong>${params.firstName}</strong>,</p>
    <p>Your reservation <strong>${params.refCode}</strong> has been cancelled.</p>

    ${params.hasRefund ? `
    <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:16px; margin:20px 0;">
      <p style="margin:0; color:#166534; font-weight:bold;">💰 Refund Processing</p>
      <p style="margin:8px 0 0; color:#555; font-size:14px;">
        Your refund will be processed within 3–5 business days to your original payment method.
      </p>
    </div>
    ` : `
    <p style="color:#555;">No charges were made for this reservation.</p>
    `}
  `, 'Reservation Cancelled — 3Jremy'),
});