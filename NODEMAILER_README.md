# 📧 Nodemailer Setup Complete!

Two-step verification is now configured to use **Nodemailer** for sending PIN codes via email.

## ✅ What's Been Set Up

1. **Email Service**: Nodemailer with SMTP support
2. **API Integration**: Automatic PIN sending via email
3. **Professional Email Template**: Beautiful HTML emails with PIN codes
4. **Environment Configuration**: `.env.smtp.example` with all options
5. **Test Script**: Easy SMTP configuration testing

## 🚀 Quick Start

### 1. Configure Your Email

Copy the SMTP example configuration:
```bash
# View the example
cat .env.smtp.example

# Add your SMTP settings to .env file
nano .env  # or use your preferred editor
```

### 2. Add SMTP Credentials

Add these lines to your `.env` file:

**For Gmail (Recommended for Testing):**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
```

**For Other Providers:** See [NODEMAILER_SETUP.md](./docs/NODEMAILER_SETUP.md)

### 3. Test Your Configuration

Run the test script to verify your SMTP setup:
```bash
npm run test-smtp
```

This will:
- ✅ Validate your SMTP credentials
- ✅ Test the connection
- ✅ Optionally send a test email

### 4. Start Using 2FA

Once SMTP is configured:
```bash
npm run dev
```

Navigate to `/auth` and try signing in. You'll receive a PIN via email!

## 📚 Documentation

- **[Nodemailer Setup Guide](./docs/NODEMAILER_SETUP.md)** - Complete setup instructions
- **[Two-Step Verification](./docs/TWO_STEP_VERIFICATION.md)** - How 2FA works
- **[.env.smtp.example](./.env.smtp.example)** - Configuration examples

## 🔧 Gmail App Password Setup

If using Gmail, you need an **App Password**:

1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification"
3. Go to https://myaccount.google.com/apppasswords
4. Select "Mail" and generate password
5. Copy the 16-digit password to `SMTP_PASS`

## 📧 Email Features

The PIN emails include:
- ✅ Professional HTML design
- ✅ Clear PIN display (4 digits)
- ✅ Security warnings
- ✅ 5-minute expiration notice
- ✅ Mobile-responsive layout
- ✅ Branded with DU Alumni '89

## 🐛 Troubleshooting

### "Invalid login" Error
- Use App Password for Gmail (not regular password)
- Verify SMTP_USER and SMTP_PASS are correct
- Check 2FA is enabled for your email account

### "Connection timeout" Error
- Verify SMTP_HOST and SMTP_PORT
- Check firewall settings
- Try port 587 instead of 465

### Emails Going to Spam
- Use a verified email domain
- Set up SPF/DKIM records
- Use reputable email provider

**Full troubleshooting guide:** See [NODEMAILER_SETUP.md](./docs/NODEMAILER_SETUP.md)

## 🔒 Security Notes

- ✅ Never commit `.env` to git
- ✅ Use App Passwords (not regular passwords)
- ✅ Rotate credentials regularly
- ✅ Monitor email sending logs
- ✅ Enable 2FA on your email account

## 📦 What's Included

### Files Created/Modified:

**New Files:**
- `lib/email/nodemailer.ts` - Email service implementation
- `.env.smtp.example` - Configuration examples
- `docs/NODEMAILER_SETUP.md` - Setup guide
- `scripts/test-smtp.js` - SMTP test script
- `NODEMAILER_README.md` - This file

**Modified Files:**
- `app/api/auth/send-pin/route.ts` - Now uses Nodemailer
- `package.json` - Added `test-smtp` script

## 🎯 Next Steps

1. ✅ Configure SMTP in `.env`
2. ✅ Run `npm run test-smtp`
3. ✅ Send a test email
4. ✅ Start the dev server
5. ✅ Test the 2FA login flow
6. ✅ Deploy to production

## 📞 Need Help?

1. Check [NODEMAILER_SETUP.md](./docs/NODEMAILER_SETUP.md)
2. Run `npm run test-smtp` for connection testing
3. Check console logs for error messages
4. Verify all environment variables are set

---

**Ready to test?** Run `npm run test-smtp` now! 🚀
