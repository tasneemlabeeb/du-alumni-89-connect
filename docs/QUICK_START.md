# Quick Start Guide - Next.js Version

## Installation & Setup

### 1. Install Next.js Dependencies

```bash
npm install next@14 react@18 react-dom@18
npm install --save-dev @types/node @types/react @types/react-dom
```

### 2. Install Firebase

```bash
npm install firebase firebase-admin
```

### 3. Install Cloudflare & AWS SDK (for R2)

```bash
npm install @aws-sdk/client-s3
npm install @aws-sdk/s3-request-presigner
```

### 4. Install UI & Utility Libraries

```bash
npm install lucide-react
npm install class-variance-authority clsx tailwind-merge
```

Or simply run:

```bash
npm install
```

This will install all dependencies from the updated `package.json`.

## Environment Configuration

Create `.env.local` in the project root:

```env
# Firebase Client Configuration (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Firebase Admin (Server-side - Keep SECRET!)
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"

# Cloudflare R2 Storage (Keep SECRET!)
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET_NAME=duaab89-media
R2_PUBLIC_URL=https://duaab89-media.your-subdomain.r2.cloudflarestorage.com
```

## Running the Application

### Development Mode

```bash
npm run dev
```

Visit: `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Firebase Setup Steps

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: `duaab89-connect`
4. Follow the setup wizard

### 2. Enable Authentication
1. In Firebase Console, go to **Authentication**
2. Click "Get Started"
3. Enable sign-in methods:
   - Email/Password
   - Google (recommended)
   - GitHub (optional)

### 3. Create Firestore Database
1. Go to **Firestore Database**
2. Click "Create Database"
3. Start in **Production mode** (or Test mode for development)
4. Choose location closest to your users

### 4. Get Configuration
1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps"
3. Click web icon (</>) to add a web app
4. Register app name: `DUAAB89 Web`
5. Copy the config values to `.env.local`

### 5. Generate Admin SDK Key
1. In **Project Settings**, go to **Service Accounts** tab
2. Click "Generate new private key"
3. Download the JSON file
4. Extract these values to `.env.local`:
   - `project_id` → `FIREBASE_ADMIN_PROJECT_ID`
   - `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY` (keep the quotes and newlines!)

## Cloudflare R2 Setup Steps

### 1. Create R2 Bucket
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to **R2 Object Storage**
3. Click "Create Bucket"
4. Name: `duaab89-media`
5. Location: Auto (or choose closest region)

### 2. Generate API Credentials
1. In R2, click "Manage R2 API Tokens"
2. Click "Create API Token"
3. Permissions:
   - Object Read
   - Object Write
   - Object Delete
4. Apply to specific bucket: `duaab89-media`
5. Copy the credentials:
   - Access Key ID → `R2_ACCESS_KEY_ID`
   - Secret Access Key → `R2_SECRET_ACCESS_KEY`
   - Account ID → `R2_ACCOUNT_ID`

### 3. Configure Public Access (Optional)
1. Go to your bucket settings
2. Click "Settings" → "Public Access"
3. Enable "Allow Public Access" if you want files to be publicly accessible
4. Note your public URL → `R2_PUBLIC_URL`

### 4. Configure CORS (for uploads from browser)
1. In bucket settings, go to "CORS Policy"
2. Add this policy:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

## Firestore Collections Structure

Create these collections in Firestore:

### `members` Collection
```javascript
{
  uid: string,              // Firebase Auth UID
  email: string,
  name: string,
  department: string,
  batch: string,
  country: string,
  city: string,
  phone: string,
  photoURL: string,        // R2 storage URL
  status: 'pending' | 'approved' | 'rejected',
  role: 'member' | 'admin',
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### `news` Collection
```javascript
{
  title: string,
  summary: string,
  content: string,
  imageURL: string,        // R2 storage URL
  published: boolean,
  authorId: string,
  created_at: timestamp,
  updated_at: timestamp
}
```

### `events` Collection
```javascript
{
  title: string,
  description: string,
  event_date: timestamp,
  location: string,
  imageURL: string,        // R2 storage URL
  created_at: timestamp
}
```

### `gallery` Collection
```javascript
{
  title: string,
  description: string,
  imageURL: string,        // R2 storage URL
  category: string,
  uploadedBy: string,
  created_at: timestamp
}
```

## Testing the Setup

### 1. Test Authentication
```bash
# Start dev server
npm run dev

# Navigate to http://localhost:3000/auth
# Try signing up with email/password
```

### 2. Test File Upload
```javascript
// In browser console or component
const file = /* select a file */;
const formData = new FormData();
formData.append('file', file);

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
});

const data = await response.json();
console.log('Uploaded:', data.url);
```

### 3. Test Firestore
```javascript
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

// Add a test document
const docRef = await addDoc(collection(db, 'test'), {
  message: 'Hello Firestore!',
  createdAt: new Date().toISOString()
});

console.log('Document added:', docRef.id);
```

## Troubleshooting

### "Cannot find module 'next'"
**Solution**: Run `npm install`

### Firebase errors
**Solution**: 
1. Check `.env.local` has all Firebase variables
2. Verify Firebase config in Console matches `.env.local`
3. Ensure Authentication is enabled

### R2 upload fails
**Solution**:
1. Verify R2 credentials in `.env.local`
2. Check CORS policy allows your origin
3. Ensure API token has correct permissions

### Build errors
**Solution**:
1. Delete `.next` folder: `rm -rf .next`
2. Clear node_modules: `rm -rf node_modules`
3. Reinstall: `npm install`
4. Rebuild: `npm run build`

## Deployment Options

### Vercel (Recommended for Next.js)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Other Platforms
- **Netlify**: Supports Next.js
- **AWS Amplify**: Full Next.js support
- **Railway**: Easy deployment
- **Digital Ocean App Platform**: Docker-based

## Next Steps

1. ✅ Install dependencies
2. ✅ Configure environment variables
3. ✅ Set up Firebase project
4. ✅ Set up Cloudflare R2 bucket
5. ⏳ Implement admin dashboard
6. ⏳ Add member directory with search
7. ⏳ Implement blog system
8. ⏳ Add gallery with upload
9. ⏳ Deploy to production

## Need Help?

- **Next.js Docs**: https://nextjs.org/docs
- **Firebase Docs**: https://firebase.google.com/docs
- **Cloudflare R2 Docs**: https://developers.cloudflare.com/r2/
- **Project Issues**: Check the documentation files in the root directory

---

**Happy coding!** 🚀
