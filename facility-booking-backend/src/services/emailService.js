const transporter = require('../config/email');

async function sendBookingConfirmation(user, booking, facility) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: 'Booking Confirmation — University Facility Booking System',
    html: `
      <h2>Booking Confirmed</h2>
      <p>Dear ${user.name},</p>
      <p>Your booking has been received and is pending confirmation.</p>
      <table style="border-collapse:collapse; width:100%; max-width:500px;">
        <tr><td style="padding:8px; border:1px solid #ddd; font-weight:bold;">Facility</td><td style="padding:8px; border:1px solid #ddd;">${facility.name}</td></tr>
        <tr><td style="padding:8px; border:1px solid #ddd; font-weight:bold;">Date</td><td style="padding:8px; border:1px solid #ddd;">${booking.booking_date}</td></tr>
        <tr><td style="padding:8px; border:1px solid #ddd; font-weight:bold;">Time</td><td style="padding:8px; border:1px solid #ddd;">${booking.start_time} – ${booking.end_time}</td></tr>
        <tr><td style="padding:8px; border:1px solid #ddd; font-weight:bold;">Purpose</td><td style="padding:8px; border:1px solid #ddd;">${booking.purpose || '—'}</td></tr>
        <tr><td style="padding:8px; border:1px solid #ddd; font-weight:bold;">Booking ID</td><td style="padding:8px; border:1px solid #ddd;">#${booking.id}</td></tr>
      </table>
      <p style="margin-top:16px;">If you need to make changes, please log in to the system.</p>
      <p>University Facility Booking System</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendBookingConfirmation };
