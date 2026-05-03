interface BookingEmailData {
  firstName: string;
  lastName: string;
  reservationId: string;
  slotHours: number;
  bikeCount: number;
  scheduledStart: string;
  totalCost: number;
}

interface CompletedEmailData {
  firstName: string;
  reservationId: string;
  totalCost: number;
  overdueCost: number;
  baseCost: number;
  actualDuration: string;
}

// --- para sa booking
export const bookingConfirmedTemplate = (data: BookingEmailData) => ({
  subject: `VeloRent Booking confirmed - ${data.reservationId.slice(-6).toUpperCase()}`,
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body        { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container  { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; }
        .header     { background: #16a34a; color: white; padding: 30px; text-align: center; }
        .header h1  { margin: 0; font-size: 24px; }
        .body       { padding: 30px; }
        .details    { margin: 20px 0; }
        .total      { background: #f0fdf4; padding: 15px; border-radius: 6px; margin-top: 20px; }
        .footer     { background: #f5f5f5; padding: 20px; text-align: center; color: #999; font-size: 12px; }
        .badge      { display: inline-block; background: #dcfce7; color: #16a34a; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚲 VeloRent</h1>
          <p style="margin:8px 0 0">Booking Confirmed!</p>
        </div>
        <div class="body">
          <p>Hi <strong>${data.firstName} ${data.lastName}</strong>,</p>
          <p>Your bike rental has been confirmed. Please present this email at the counter.</p>

          <div class="details">
            <table style="width:100%; border-collapse:collapse;">
              <tr>
                <td style="color:#666; font-size:14px; padding:10px 0; border-bottom:1px solid #eee;">Booking Reference</td>
                <td style="font-weight:bold; font-size:14px; text-align:right; padding:10px 0; border-bottom:1px solid #eee;">#${data.reservationId.slice(-6).toUpperCase()}</td>
              </tr>
              <tr>
                <td style="color:#666; font-size:14px; padding:10px 0; border-bottom:1px solid #eee;">Number of Bikes</td>
                <td style="font-weight:bold; font-size:14px; text-align:right; padding:10px 0; border-bottom:1px solid #eee;">${data.bikeCount} bike${data.bikeCount > 1 ? "s" : ""}</td>
              </tr>
              <tr>
                <td style="color:#666; font-size:14px; padding:10px 0; border-bottom:1px solid #eee;">Slot Duration</td>
                <td style="font-weight:bold; font-size:14px; text-align:right; padding:10px 0; border-bottom:1px solid #eee;">${data.slotHours} hour${data.slotHours > 1 ? "s" : ""}</td>
              </tr>
              <tr>
                <td style="color:#666; font-size:14px; padding:10px 0; border-bottom:1px solid #eee;">Scheduled Start</td>
                <td style="font-weight:bold; font-size:14px; text-align:right; padding:10px 0; border-bottom:1px solid #eee;">${new Date(data.scheduledStart).toLocaleString(
                  "en-PH",
                  {
                    timeZone: "Asia/Manila",
                    dateStyle: "medium",
                    timeStyle: "short",
                  },
                )}</td>
              </tr>
            </table>
          </div>

          <div class="total">
            <table style="width:100%;">
              <tr>
                <td style="font-weight:bold;">Total Paid</td>
                <td style="color:#16a34a; font-size:20px; font-weight:bold; text-align:right;">₱${(data.totalCost / 100).toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <p style="margin-top:20px; color:#666; font-size:13px;">
            ⚠️ <strong>Overdue policy:</strong> ₱50 is charged for every 15 minutes past your slot.
            Please return bikes on time to avoid additional charges.
          </p>
        </div>
        <div class="footer">
          <p>VeloRent — Enjoy your ride! 🚲</p>
          <p>This is an automated message. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `,
});

// para sa complted na ride
export const rideCompletedTemplate = (data: CompletedEmailData) => ({
  subject: `VeloRent Ride Completed — #${data.reservationId.slice(-6).toUpperCase()}`,
  html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body        { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
          .container  { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; }
          .header     { background: #2563eb; color: white; padding: 30px; text-align: center; }
          .header h1  { margin: 0; font-size: 24px; }
          .body       { padding: 30px; }
          .details    { margin: 20px 0; }
          .total      { background: #eff6ff; padding: 15px; border-radius: 6px; margin-top: 20px; }
          .overdue    { background: #fef2f2; padding: 15px; border-radius: 6px; margin-top: 10px; color: #dc2626; }
          .footer     { background: #f5f5f5; padding: 20px; text-align: center; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚲 VeloRent</h1>
            <p style="margin:8px 0 0">Ride Completed — Thank you!</p>
          </div>
          <div class="body">
            <p>Hi <strong>${data.firstName}</strong>, thanks for riding with VeloRent!</p>

            <div class="details">
              <table style="width:100%; border-collapse:collapse;">
                <tr>
                  <td style="color:#666; font-size:14px; padding:10px 0; border-bottom:1px solid #eee;">Booking Reference</td>
                  <td style="font-weight:bold; font-size:14px; text-align:right; padding:10px 0; border-bottom:1px solid #eee;">#${data.reservationId.slice(-6).toUpperCase()}</td>
                </tr>
                <tr>
                  <td style="color:#666; font-size:14px; padding:10px 0; border-bottom:1px solid #eee;">Duration</td>
                  <td style="font-weight:bold; font-size:14px; text-align:right; padding:10px 0; border-bottom:1px solid #eee;">${data.actualDuration}</td>
                </tr>
                <tr>
                  <td style="color:#666; font-size:14px; padding:10px 0; border-bottom:1px solid #eee;">Base Cost</td>
                  <td style="font-weight:bold; font-size:14px; text-align:right; padding:10px 0; border-bottom:1px solid #eee;">₱${(data.baseCost / 100).toFixed(2)}</td>
                </tr>
              </table>
            </div>

            ${data.overdueCost > 0 ? `
            <div class="overdue">
              <table style="width:100%;">
                <tr>
                  <td>⚠️ Overdue Charge</td>
                  <td style="text-align:right; font-weight:bold;">₱${(data.overdueCost / 100).toFixed(2)}</td>
                </tr>
              </table>
              <p style="margin:8px 0 0; font-size:12px">Please settle overdue charges at the counter.</p>
            </div>
            ` : ''}

            <div class="total">
              <table style="width:100%;">
                <tr>
                  <td style="font-weight:bold;">Total</td>
                  <td style="color:#2563eb; font-size:20px; font-weight:bold; text-align:right;">₱${(data.totalCost / 100).toFixed(2)}</td>
                </tr>
              </table>
            </div>

            <p style="margin-top:20px; color:#666; font-size:13px; text-align:center">
              We hope you enjoyed your ride! Come back soon 🚲
            </p>
          </div>
          <div class="footer">
            <p>VeloRent — This is an automated message. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
  `,
});
