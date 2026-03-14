const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendOTPEmail(to, otp) {
  const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CoreInventory Password Reset</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f6; color: #333333; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f7f6; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05); max-width: 600px; width: 100%; margin: 0 auto;">
          <!-- Header -->
          <tr>
            <td align="center" style="background-color: #f97316; padding: 30px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px;">CoreInventory</h1>
            </td>
          </tr>
          
          <!-- Body Section -->
          <tr>
            <td style="padding: 40px 40px 30px;">
              <h2 style="margin: 0 0 20px; font-size: 20px; font-weight: 600; color: #1f2937;">Password Reset Request</h2>
              
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #4b5563;">
                Hello,
              </p>
              
              <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #4b5563;">
                We received a request to reset your password for your CoreInventory account. Please use the following One-Time Password (OTP) to proceed with your password reset.
              </p>
              
              <!-- OTP Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 32px;">
                <tr>
                  <td align="center">
                    <div style="background-color: #f3f4f6; border: 2px dashed #d1d5db; border-radius: 8px; padding: 24px; text-align: center; display: inline-block; min-width: 250px;">
                      <span style="display: block; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-bottom: 12px; font-weight: 600;">Your Verification Code</span>
                      <span style="display: block; font-size: 36px; font-weight: 700; color: #f97316; letter-spacing: 6px;">${otp}</span>
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- Instructions & Expiry -->
              <div style="background-color: #fff7ed; border-left: 4px solid #f97316; padding: 16px 20px; margin-bottom: 32px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0 0 8px; font-size: 15px; color: #9a3412; font-weight: 600;">
                  ⏳ Code expires in 10 minutes
                </p>
                <p style="margin: 0; font-size: 14px; color: #9a3412; line-height: 1.5;">
                  If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
                </p>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0 0 32px;" />
              
              <!-- Warning Section -->
              <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #dc2626; font-weight: 500; text-align: center;">
                ⚠️ Security Warning: Never share this OTP with anyone, including CoreInventory staff.
              </p>
            </td>
          </tr>
          
          <!-- Footer Section -->
          <tr>
            <td align="center" style="background-color: #f9fafb; padding: 24px 40px; border-top: 1px solid #f3f4f6;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280;">
                &copy; ${new Date().getFullYear()} CoreInventory. All rights reserved.
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                This is an automated message, please do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
        
        <!-- Bottom spacing -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td height="40" style="font-size: 40px; line-height: 40px;">&nbsp;</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  await transporter.sendMail({
    from: `"CoreInventory" <${process.env.EMAIL_FROM}>`,
    to,
    subject: 'CoreInventory — Password Reset OTP',
    html: htmlTemplate,
  });
}

module.exports = { sendOTPEmail };
