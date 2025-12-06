# Firebase Migration Guide

## ⚠️ Important Security Warning

The service account credentials you have should **NEVER** be used in client-side code. They should be stored securely on a backend server.

## 📋 Steps to Complete the Migration

### 1. Get Firebase Web App Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `duaab89-67c12`
3. Click ⚙️ (Settings) → **Project settings**
4. Scroll to **"Your apps"** section
5. If no web app exists:
   - Click **"Add app"** → Select **Web** icon (</>)
   - Give it a nickname (e.g., "Alumni Connect Web")
   - Register the app
6. Copy the configuration object that looks like:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "duaab89-67c12.firebaseapp.com",
  projectId: "duaab89-67c12",
  storageBucket: "duaab89-67c12.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### 2. Update Environment Variables

Open `.env.local` and replace the placeholder values with your actual Firebase web app config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=duaab89-67c12.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=duaab89-67c12
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=duaab89-67c12.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_actual_app_id
```

### 3. Enable Firebase Authentication

In Firebase Console:
1. Go to **Authentication** → **Get started**
2. Enable the sign-in methods you need:
   - Email/Password
   - Google
   - GitHub
   - etc.

### 4. Set up Firestore Database

1. Go to **Firestore Database** → **Create database**
2. Choose production mode or test mode
3. Select a location closest to your users

### 5. Configure Cloudflare R2 (for file storage)

If you need file storage with Cloudflare R2:
1. Go to Cloudflare Dashboard → R2
2. Create a bucket
3. Generate API tokens
4. Add to `.env.local`:

```env
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=https://your-bucket.r2.cloudflarestorage.com
```

**Note:** R2 credentials should be kept server-side only and used in API routes.

## 🚀 What's Been Set Up

- ✅ Firebase SDK installed
- ✅ Firebase configuration files created (`lib/firebase/config.ts` and `lib/firebase/admin.ts`)
- ✅ Environment variables template created (`.env.local`)
- ✅ Git ignore configured to protect credentials
- ✅ Cloudflare R2 integration for file storage (`lib/cloudflare/r2.ts`)
- ✅ Upload and delete API routes created (`app/api/upload/` and `app/api/delete/`)

## 📝 Next Steps

Once you provide the Firebase web app configuration:
1. Update `.env.local` with your Firebase credentials
2. Configure Firestore security rules
3. Set up Cloudflare R2 bucket
4. Test authentication and file uploads

## 📚 Resources

- [Firebase Web Setup Guide](https://firebase.google.com/docs/web/setup)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [Next.js Documentation](https://nextjs.org/docs)
