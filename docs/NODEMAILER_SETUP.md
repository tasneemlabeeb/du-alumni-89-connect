# Nodemailer SMTP Setup Guide

## Overview

This guide will help you set up email sending for the two-step verification system using Nodemailer with SMTP.

## Prerequisites

- An email account to send emails from
- SMTP server credentials

## Quick Setup

### Step 1: Install Dependencies (Already Done)

The required packages are already installed:
```bash
npm install nodemailer @types/nodemailer
```

### Step 2: Choose Your Email Provider

#### Option A: Gmail (Recommended for Testing)

**Setup Instructions:**

1. **Enable 2-Step Verification:**
   - Go to https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Create App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Click "Generate"
   - Copy the 16-digit password (e.g., `abcd efgh ijkl mnop`)

3. **Add to `.env` file:**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=abcdefghijklmnop
   SMTP_FROM=your-email@gmail.com
   ```

#### Option B: Outlook/Hotmail

**Setup Instructions:**

1. **Add to `.env` file:**
   ```env
   SMTP_HOST=smtp-mail.outlook.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@outlook.com
   SMTP_PASS=your-password
   SMTP_FROM=your-email@outlook.com
   ```

#### Option C: Yahoo Mail

**Setup Instructions:**

1. **Enable App Password:**
   - Go to Yahoo Account Security
   - Generate an app password

2. **Add to `.env` file:**
   ```env
   SMTP_HOST=smtp.mail.yahoo.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@yahoo.com
   SMTP_PASS=your-app-password
   SMTP_FROM=your-email@yahoo.com
   ```

#### Option D: Custom SMTP Server

If you have your own mail server or use a hosting provider:

```env
SMTP_HOST=mail.yourserver.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=admin@yourserver.com
SMTP_PASS=your-password
SMTP_FROM=noreply@yourserver.com
```

### Step 3: Add Environment Variables

1. **Open or create `.env` file** in the project root
2. **Add your SMTP configuration** (see examples above)
3. **Save the file**

### Step 4: Test Email Connection

Create a test script or use the dev server to verify the configuration:

```typescript
// Test in your code
import { testEmailConnection } from '@/lib/email/nodemailer';

const result = await testEmailConnection();
console.log('Email connection test:', result ? 'Success' : 'Failed');
```

## Configuration Options

### Environment Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` | Yes |
| `SMTP_PORT` | SMTP server port | `587` | Yes |
| `SMTP_SECURE` | Use SSL (true for 465) | `false` | No (default: false) |
| `SMTP_USER` | Email account username | `you@gmail.com` | Yes |
| `SMTP_PASS` | Email account password | `your-password` | Yes |
| `SMTP_FROM` | From address in emails | `noreply@example.com` | No (defaults to SMTP_USER) |

### Port Selection

- **Port 587**: TLS/STARTTLS (recommended) - Use `SMTP_SECURE=false`
- **Port 465**: SSL (legacy) - Use `SMTP_SECURE=true`
- **Port 25**: Unencrypted (not recommended)

## Email Template

The PIN emails include:
- Professional HTML design
- Clear PIN display
- Security warnings
- Expiration notice (5 minutes)
- Responsive layout for mobile devices

## Troubleshooting

### Common Issues

#### 1. "Invalid login" or "Authentication failed"

**Solutions:**
- Verify SMTP_USER and SMTP_PASS are correct
- For Gmail: Use App Password, not your regular password
- Check if 2FA is enabled (required for Gmail App Passwords)
- Ensure "Less secure app access" is enabled (if not using App Password)

#### 2. "Connection timeout" or "ETIMEDOUT"

**Solutions:**
- Check SMTP_HOST is correct
- Verify SMTP_PORT is correct
- Check firewall settings
- Try different port (587 vs 465)

#### 3. "Self signed certificate" error

**Solutions:**
Add to Nodemailer config:
```typescript
tls: {
  rejectUnauthorized: false
}
```

#### 4. Emails go to spam

**Solutions:**
- Use a verified domain for SMTP_FROM
- Set up SPF records for your domain
- Set up DKIM signing
- Use a reputable email service

### Debug Mode

Enable debug output by adding to `.env`:
```env
NODE_DEBUG=nodemailer
```

### Test SMTP Connection

Run this in a Node.js environment:
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log('Error:', error);
  } else {
    console.log('Server is ready to send emails');
  }
});
```

## Security Best Practices

✅ **Use App Passwords** for Gmail (not regular password)
✅ **Never commit** `.env` file to version control
✅ **Use environment variables** for all credentials
✅ **Enable 2FA** on your email account
✅ **Monitor** email sending logs for suspicious activity
✅ **Rotate passwords** regularly
✅ **Use dedicated email** for automated emails (not personal)

## Production Deployment

### Vercel

Add environment variables in Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add each SMTP variable
3. Redeploy the application

### Other Platforms

Ensure all SMTP environment variables are set in your hosting platform's environment configuration.

## Email Service Recommendations

For production, consider dedicated email services:

1. **SendGrid** - Free tier: 100 emails/day
2. **AWS SES** - Very cheap, pay-as-you-go
3. **Mailgun** - Free tier: 5,000 emails/month
4. **Postmark** - Focus on transactional emails

These services offer:
- Better deliverability
- Email analytics
- Bounce handling
- Scalability
- Compliance tools

## Testing

### Local Testing

1. Configure `.env` with your SMTP settings
2. Start the dev server: `npm run dev`
3. Navigate to `/auth`
4. Try to sign in
5. Check your email for the PIN

### Testing Checklist

- [ ] Email is received
- [ ] PIN is correctly displayed
- [ ] Email formatting looks good (check HTML rendering)
- [ ] Links work (if any)
- [ ] Mobile rendering is correct
- [ ] Email doesn't go to spam
- [ ] PIN expiration works (wait 5+ minutes)
- [ ] Resend functionality works

## Support

If you encounter issues:

1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Test SMTP connection using the verification script
4. Check your email provider's documentation
5. Review firewall and security settings

## Next Steps

Once email is working:

1. ✅ Test the complete 2FA flow
2. ✅ Monitor email delivery rates
3. ✅ Set up email sending alerts
4. ✅ Consider adding rate limiting
5. ✅ Implement email delivery tracking

---

**Need Help?** Check the logs in your terminal for detailed error messages.
