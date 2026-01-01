import nodemailer from 'nodemailer';

// Email configuration
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_SECURE = process.env.SMTP_SECURE === 'true'; // true for 465, false for other ports
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || process.env.SMTP_USER;

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    if (!SMTP_USER || !SMTP_PASS) {
      throw new Error('SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS environment variables.');
    }

    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    console.log('[Email Service] Transporter configured:', {
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      from: SMTP_FROM,
    });
  }

  return transporter;
}

export interface SendPinEmailOptions {
  email: string;
  pin: string;
}

export async function sendPinEmail({ email, pin }: SendPinEmailOptions): Promise<void> {
  const transporter = getTransporter();

  const mailOptions = {
    from: `"DU Alumni 89" <${SMTP_FROM}>`,
    to: email,
    subject: 'Your Login Verification Code - DU Alumni 89',
    text: `
Your verification code is: ${pin}

This code will expire in 5 minutes.

If you didn't request this code, please ignore this email.

Best regards,
DU Alumni '89 Connect Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verification Code</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">DU Alumni '89</h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">Two-Step Verification</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 22px;">Login Verification Code</h2>
              <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.5;">
                You requested to sign in to your DU Alumni '89 account. Please use the verification code below to complete your login:
              </p>
              
              <!-- PIN Code -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px; display: inline-block;">
                      <div style="background-color: #ffffff; padding: 20px 40px; border-radius: 4px;">
                        <span style="font-size: 48px; font-weight: bold; letter-spacing: 16px; color: #667eea; font-family: 'Courier New', monospace;">
                          ${pin}
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 20px 0; color: #666666; font-size: 14px; line-height: 1.5;">
                <strong>Important:</strong> This code will expire in <strong>5 minutes</strong>.
              </p>
              
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <p style="margin: 0; color: #856404; font-size: 14px;">
                  <strong>⚠️ Security Notice:</strong> If you didn't request this code, please ignore this email. Never share this code with anyone.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 13px; line-height: 1.5;">
                Best regards,<br>
                <strong>DU Alumni '89 Connect Team</strong>
              </p>
              <p style="margin: 10px 0 0 0; color: #6c757d; font-size: 12px; line-height: 1.5;">
                This is an automated message. Please do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('[Email Service] PIN sent successfully:', {
      messageId: info.messageId,
      recipient: email,
      accepted: info.accepted,
      rejected: info.rejected,
    });
  } catch (error: any) {
    console.error('[Email Service] Failed to send PIN:', {
      error: error.message,
      recipient: email,
    });
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

export interface SendApprovalEmailOptions {
  email: string;
  fullName: string;
}

export async function sendApprovalEmail({ email, fullName }: SendApprovalEmailOptions): Promise<void> {
  const transporter = getTransporter();

  const mailOptions = {
    from: `"DU Alumni 89" <${SMTP_FROM}>`,
    to: email,
    subject: '🎉 Your DU Alumni 89 Membership Has Been Approved!',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Membership Approved</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                🎉 Congratulations!
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Dear <strong>${fullName}</strong>,
              </p>
              
              <p style="margin: 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Great news! Your membership application for <strong>DU Alumni '89 Connect</strong> has been reviewed and <strong style="color: #10b981;">approved</strong> by our administrators.
              </p>

              <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 8px; padding: 25px; margin: 30px 0; text-align: center;">
                <p style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 600;">
                  ✓ Your account is now fully activated!
                </p>
              </div>

              <p style="margin: 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                You now have full access to all member features including:
              </p>

              <table role="presentation" style="width: 100%; margin: 20px 0;">
                <tr>
                  <td style="padding: 12px; border-left: 3px solid #667eea;">
                    <span style="color: #333333; font-size: 15px;">📸 <strong>Photo Gallery</strong> - Browse and share memories</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px; border-left: 3px solid #667eea;">
                    <span style="color: #333333; font-size: 15px;">👥 <strong>Member Directory</strong> - Connect with fellow alumni</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px; border-left: 3px solid #667eea;">
                    <span style="color: #333333; font-size: 15px;">📰 <strong>News & Events</strong> - Stay updated with alumni activities</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px; border-left: 3px solid #667eea;">
                    <span style="color: #333333; font-size: 15px;">✍️ <strong>Blog Posts</strong> - Share your stories and experiences</span>
                  </td>
                </tr>
              </table>

              <div style="text-align: center; margin: 35px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" 
                   style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4);">
                  Visit DU Alumni 89 Connect →
                </a>
              </div>

              <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 4px; margin: 25px 0;">
                <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                  <strong>💡 Tip:</strong> Complete your profile with professional details and photos to make the most of your membership and help fellow alumni recognize and connect with you!
                </p>
              </div>

              <p style="margin: 25px 0 0 0; color: #333333; font-size: 16px; line-height: 1.6;">
                We're excited to have you as part of our alumni community. If you have any questions or need assistance, please don't hesitate to reach out.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 13px; line-height: 1.5;">
                Best regards,<br>
                <strong>DU Alumni '89 Connect Team</strong>
              </p>
              <p style="margin: 10px 0 0 0; color: #6c757d; font-size: 12px; line-height: 1.5;">
                This is an automated message. Please do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('[Email Service] Approval notification sent successfully:', {
      messageId: info.messageId,
      recipient: email,
      accepted: info.accepted,
      rejected: info.rejected,
    });
  } catch (error: any) {
    console.error('[Email Service] Failed to send approval notification:', {
      error: error.message,
      recipient: email,
    });
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

// Test email connection
export async function testEmailConnection(): Promise<boolean> {
  try {
    const transporter = getTransporter();
    await transporter.verify();
    console.log('[Email Service] SMTP connection verified successfully');
    return true;
  } catch (error: any) {
    console.error('[Email Service] SMTP connection failed:', error.message);
    return false;
  }
}
