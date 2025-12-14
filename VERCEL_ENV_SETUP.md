# Vercel Environment Variables Setup

## ✅ Status: Environment Variables Added

All required Firebase environment variables have been added to Vercel.
Ready for redeployment!

## Quick Fix Steps

### 1. Copy Your Environment Variables

Open your local `.env` file and copy the values for these variables:

**Firebase Client (Public):**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

**Firebase Admin (Secret):**
- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`

**Cloudflare R2 (Secret):**
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_URL`

### 2. Add to Vercel

1. Go to: https://vercel.com/tasneemzamans-projects/du-alumni-89-connect/settings/environment-variables
2. Click **Add New** for each variable
3. Paste the **Key** (variable name) and **Value** from your `.env` file
4. Select environments: **Production**, **Preview**, **Development**
5. Click **Save**

### 3. Special Handling for FIREBASE_ADMIN_PRIVATE_KEY

The private key contains newlines. In Vercel:
- Keep the quotes
- Keep the `\n` characters (don't replace with actual newlines)
- Should look like: `"-----BEGIN PRIVATE KEY-----\nMIIE...your key...xyz\n-----END PRIVATE KEY-----\n"`

### 4. Redeploy

After adding all variables:
- Go to: https://vercel.com/tasneemzamans-projects/du-alumni-89-connect
- Find the failed deployment
- Click **"..."** → **Redeploy**

## Alternative: Use Vercel CLI

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Link your project
vercel link

# Add environment variables from your .env file
vercel env pull .env.production
```

## Verify Deployment

After redeployment succeeds, test:
1. Visit your production URL
2. Try logging in
3. Check if Firebase auth works
4. Verify file uploads work (if using R2)

---

**Next Steps After Successful Deployment:**
- Update your Firebase Auth authorized domains to include your Vercel domain
- Test all features in production
- Monitor Vercel logs for any runtime errors
