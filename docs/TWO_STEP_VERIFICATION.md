# Two-Step Verification Implementation

## Overview

This application now implements two-step verification (2FA) for user login using email-based PIN codes.

## How It Works

1. **Step 1: Credential Verification**
   - User enters email and password
   - System validates credentials with Firebase Authentication
   - If valid, user is temporarily signed out and a 4-digit PIN is generated

2. **Step 2: PIN Verification**
   - A 4-digit PIN is sent to the user's email
   - PIN expires after 5 minutes
   - User enters the PIN to complete sign-in
   - Upon successful verification, user is fully authenticated

## Development Mode

In development mode (`NODE_ENV === 'development`):
- The PIN is displayed in the UI for testing purposes
- The PIN is also logged to the console
- **IMPORTANT**: This behavior is disabled in production

## Production Setup

### Email Service Integration

For production, you need to integrate an email service. Here are the recommended options:

### Option 1: SendGrid (Recommended)

1. **Install SendGrid SDK:**
   ```bash
   npm install @sendgrid/mail
   ```

2. **Get SendGrid API Key:**
   - Sign up at https://sendgrid.com
   - Create an API key in Settings > API Keys
   - Add to your environment variables

3. **Update `.env`:**
   ```
   SENDGRID_API_KEY=your_sendgrid_api_key_here
   SENDGRID_FROM_EMAIL=noreply@yourdomain.com
   ```

4. **Update `/app/api/auth/send-pin/route.ts`:**

   Replace the TODO section with:
   ```typescript
   import sgMail from '@sendgrid/mail';
   
   sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
   
   await sgMail.send({
     to: email,
     from: process.env.SENDGRID_FROM_EMAIL!,
     subject: 'Your Login Verification Code - DU Alumni 89',
     text: `Your verification code is: ${pin}\n\nThis code will expire in 5 minutes.\n\nIf you didn't request this code, please ignore this email.`,
     html: `
       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
         <h2>Login Verification Code</h2>
         <p>Your verification code is:</p>
         <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 10px; margin: 20px 0;">
           ${pin}
         </div>
         <p>This code will expire in 5 minutes.</p>
         <p style="color: #666; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
       </div>
     `,
   });
   ```

### Option 2: AWS SES

1. **Install AWS SDK:**
   ```bash
   npm install @aws-sdk/client-ses
   ```

2. **Update `.env`:**
   ```
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=us-east-1
   AWS_SES_FROM_EMAIL=noreply@yourdomain.com
   ```

3. **Update `/app/api/auth/send-pin/route.ts`:**
   ```typescript
   import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
   
   const sesClient = new SESClient({ region: process.env.AWS_REGION });
   
   const command = new SendEmailCommand({
     Destination: { ToAddresses: [email] },
     Message: {
       Body: {
         Text: { Data: `Your verification code is: ${pin}. This code will expire in 5 minutes.` },
         Html: { Data: `<h2>Your verification code is: <strong>${pin}</strong></h2><p>This code will expire in 5 minutes.</p>` }
       },
       Subject: { Data: 'Your Login Verification Code - DU Alumni 89' }
     },
     Source: process.env.AWS_SES_FROM_EMAIL!
   });
   
   await sesClient.send(command);
   ```

### Option 3: Nodemailer (with SMTP)

1. **Install Nodemailer:**
   ```bash
   npm install nodemailer
   ```

2. **Update `.env`:**
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_specific_password
   SMTP_FROM=noreply@yourdomain.com
   ```

3. **Update `/app/api/auth/send-pin/route.ts`:**
   ```typescript
   import nodemailer from 'nodemailer';
   
   const transporter = nodemailer.createTransport({
     host: process.env.SMTP_HOST,
     port: parseInt(process.env.SMTP_PORT || '587'),
     secure: false,
     auth: {
       user: process.env.SMTP_USER,
       pass: process.env.SMTP_PASS,
     },
   });
   
   await transporter.sendMail({
     from: process.env.SMTP_FROM,
     to: email,
     subject: 'Your Login Verification Code - DU Alumni 89',
     text: `Your verification code is: ${pin}. This code will expire in 5 minutes.`,
     html: `<h2>Your verification code is: <strong>${pin}</strong></h2><p>This code will expire in 5 minutes.</p>`,
   });
   ```

## Firestore Security Rules

Add the following rules to your `firestore.rules` file:

```javascript
match /auth_pins/{email} {
  // Only the server can write PIN documents
  allow read, write: if false;
}
```

This ensures that PINs can only be managed through the server-side API routes.

## Security Features

✅ **PIN Expiration**: PINs expire after 5 minutes
✅ **One-Time Use**: PINs are deleted after successful verification
✅ **Secure Storage**: PINs are stored server-side in Firestore
✅ **Rate Limiting**: Consider adding rate limiting to prevent abuse (recommended)
✅ **No Client-Side Exposure**: PINs are never exposed to the client (except in dev mode)

## Testing

### Development Testing
1. Start the development server: `npm run dev`
2. Navigate to the login page
3. Enter valid credentials
4. The PIN will be displayed in the UI and console
5. Enter the PIN to complete sign-in

### Production Testing
1. Ensure email service is properly configured
2. Test with a real email address
3. Check email delivery
4. Verify PIN expiration works (wait 5+ minutes)
5. Test "Resend Code" functionality

## Troubleshooting

### PIN Not Received
- Check spam/junk folder
- Verify email service credentials
- Check API logs for errors
- Ensure email service is properly configured

### PIN Already Expired
- PINs expire after 5 minutes
- Use the "Resend Code" button to get a new PIN

### Invalid PIN Error
- Ensure you're entering the correct 4-digit code
- Check if the PIN has expired
- Request a new PIN if needed

## Future Enhancements

Consider implementing:
- Rate limiting on PIN requests
- Account lockout after multiple failed attempts
- SMS-based 2FA as an alternative
- Remember device functionality
- Backup codes for account recovery
