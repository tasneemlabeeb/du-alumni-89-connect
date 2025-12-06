# Next.js Migration - Quick Start Guide

## ✅ What Has Been Completed

### 1. Core Infrastructure
- ✅ Next.js 15 project structure created
- ✅ App Router configuration (`app/` directory)
- ✅ TypeScript configuration
- ✅ Tailwind CSS setup
- ✅ shadcn-ui components migrated

### 2. Firebase Integration
- ✅ Client-side Firebase config (`lib/firebase/config.ts`)
- ✅ Server-side Firebase Admin config (`lib/firebase/admin.ts`)
- ✅ Firebase Authentication hook (`hooks/useAuth.tsx`)
- ✅ Firestore database setup

### 3. Cloudflare R2 Storage
- ✅ R2 client configuration (`lib/cloudflare/r2.ts`)
- ✅ File upload API route (`app/api/upload/route.ts`)
- ✅ File delete API route (`app/api/delete/route.ts`)

### 4. Components Migrated
- ✅ All UI components copied to `components/ui/`
- ✅ Navigation component updated for Next.js
- ✅ ProtectedRoute component updated for Next.js
- ✅ Footer component copied
- ✅ Admin components copied
- ✅ Layout components migrated

### 5. Pages Created
- ✅ Home page (`app/page.tsx`) with Firestore integration
- ✅ Auth page (`app/auth/page.tsx`) with Firebase Auth
- ✅ Root layout (`app/layout.tsx`) with providers

### 6. Configuration Files
- ✅ `next.config.mjs` - Next.js configuration
- ✅ `.env.local.example` - Environment variables template
- ✅ `tsconfig.next.json` - TypeScript paths
- ✅ `next-package.json` - Dependencies list

### 7. Documentation
- ✅ `MIGRATION_GUIDE.md` - Comprehensive migration guide
- ✅ `README_NEXTJS.md` - Next.js project documentation
- ✅ `migrate.sh` - Automated migration script
- ✅ `NEXT_STEPS.md` - This file

## 🔄 Next Steps (To Complete Migration)

### Step 1: Install Dependencies
```bash
# Backup old package.json
mv package.json package.json.old

# Use new Next.js package.json
mv next-package.json package.json

# Install dependencies
npm install
# or
bun install
```

### Step 2: Set Up Environment Variables
```bash
# Copy template
cp .env.local.example .env.local

# Edit .env.local and add your credentials:
# - Firebase config (from Firebase Console)
# - Firebase Admin SDK key (Service Account)
# - Cloudflare R2 credentials (from Cloudflare Dashboard)
```

### Step 3: Create Remaining Pages

You need to create these page files in the `app/` directory:

```bash
mkdir -p app/about app/directory app/news app/gallery app/birthday app/blog app/admin app/profile
```

Then convert the following pages from `src/pages/` to Next.js format:

1. **app/about/page.tsx** - From `src/pages/About.tsx`
2. **app/directory/page.tsx** - From `src/pages/Directory.tsx` 
   - Replace Supabase queries with Firestore
3. **app/news/page.tsx** - From `src/pages/News.tsx`
   - Replace Supabase queries with Firestore
4. **app/gallery/page.tsx** - From `src/pages/Gallery.tsx`
   - Replace Supabase Storage with R2
5. **app/birthday/page.tsx** - From `src/pages/Birthday.tsx`
   - Replace Supabase queries with Firestore
6. **app/blog/page.tsx** - From `src/pages/BlogDemo.tsx`
   - Replace Supabase queries with Firestore
7. **app/admin/page.tsx** - From `src/pages/Admin.tsx`
   - Replace Supabase queries with Firestore
8. **app/profile/page.tsx** - From `src/pages/Profile.tsx`
   - Replace Supabase queries with Firestore
   - Replace Supabase Storage with R2

### Step 4: Update Admin Components

The admin component in `components/admin/NewsEventManagement.tsx` needs to be updated to use Firestore instead of Supabase.

### Step 5: Set Up Firestore Collections

Create these collections in Firebase Firestore:

1. **members** - User profiles
   ```javascript
   {
     user_id: string,
     full_name: string,
     email: string,
     status: 'pending' | 'approved',
     department: string,
     batch_year: number,
     profile_photo_url: string,
     created_at: timestamp
   }
   ```

2. **user_roles** - User permissions
   ```javascript
   {
     user_id: string,
     role: 'admin' | 'member'
   }
   ```

3. **news** - News articles
   ```javascript
   {
     title: string,
     summary: string,
     content: string,
     published: boolean,
     created_at: timestamp
   }
   ```

4. **events** - Events
   ```javascript
   {
     title: string,
     description: string,
     event_date: timestamp,
     location: string,
     created_at: timestamp
   }
   ```

5. **gallery** - Photos
   ```javascript
   {
     title: string,
     image_url: string,
     uploaded_by: string,
     created_at: timestamp
   }
   ```

### Step 6: Configure Firestore Security Rules

In Firebase Console, set up security rules as documented in `MIGRATION_GUIDE.md`.

### Step 7: Configure Cloudflare R2

1. Create an R2 bucket
2. Generate API tokens
3. Configure CORS (see `MIGRATION_GUIDE.md`)
4. Optionally set up public access

### Step 8: Data Migration

#### Export from Supabase
```sql
-- Export members
COPY (SELECT * FROM members) TO '/tmp/members.csv' WITH CSV HEADER;

-- Export news
COPY (SELECT * FROM news) TO '/tmp/news.csv' WITH CSV HEADER;

-- Export events
COPY (SELECT * FROM events) TO '/tmp/events.csv' WITH CSV HEADER;

-- Export gallery
COPY (SELECT * FROM gallery) TO '/tmp/gallery.csv' WITH CSV HEADER;
```

#### Import to Firestore
Use Firebase Admin SDK or Firebase Console to import the CSV data.

#### Migrate Files from Supabase Storage to R2
Create a migration script using the R2 upload API.

### Step 9: Test the Application

```bash
npm run dev
```

Visit `http://localhost:3000` and test:
- [ ] Home page loads
- [ ] Sign up creates user
- [ ] Sign in works
- [ ] Protected routes redirect
- [ ] Admin panel (for admin users)
- [ ] File uploads to R2
- [ ] All pages render correctly

### Step 10: Deploy to Production

#### Option A: Vercel (Recommended)
1. Push code to GitHub
2. Import to Vercel
3. Set environment variables
4. Deploy

#### Option B: Other platforms
- Can deploy to any platform that supports Next.js
- Ensure environment variables are set

## 📝 Important Notes

### TypeScript Errors
The current TypeScript errors are expected because:
- Next.js dependencies haven't been installed yet
- Run `npm install` to resolve these

### Import Path Updates
When working with pages, use these Next.js imports:

**Next.js:**
```typescript
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
```

### Firestore Query Examples

**Firestore:**
```typescript
const membersRef = collection(db, 'members');
const q = query(membersRef, where('status', '==', 'approved'));
const snapshot = await getDocs(q);
const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

### File Upload with R2

**Client-side:**
```typescript
const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', 'profiles');

  // Get Firebase auth token
  const token = await auth.currentUser?.getIdToken();

  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const { url } = await response.json();
  return url;
};
```

## 🆘 Troubleshooting

### Module not found errors
```bash
npm install
# or
rm -rf node_modules package-lock.json
npm install
```

### Firebase errors
- Check environment variables in `.env.local`
- Verify Firebase project settings
- Check security rules in Firestore

### R2 upload errors
- Verify R2 credentials
- Check CORS configuration
- Ensure bucket exists

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [Firestore Query Documentation](https://firebase.google.com/docs/firestore/query-data/queries)

## ✨ Migration Checklist

- [ ] Install Next.js dependencies
- [ ] Set up environment variables
- [ ] Create remaining page files
- [ ] Update admin components
- [ ] Set up Firestore collections
- [ ] Configure security rules
- [ ] Configure Cloudflare R2
- [ ] Migrate data from Supabase
- [ ] Migrate files to R2
- [ ] Test all features
- [ ] Deploy to production

## 🎉 You're Almost There!

The foundation is complete. Follow the steps above to finish the migration. If you need help with any step, refer to `MIGRATION_GUIDE.md` for detailed instructions.

Good luck! 🚀
