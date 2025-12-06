# Gallery System - Quick Start Guide

## 🚀 Getting Started

### Step 1: Deploy Firestore Rules
The Firestore security rules have been updated to include the gallery collections. Deploy them:

```bash
# Option 1: Use the deployment script
npm run deploy-rules

# Option 2: Manual deployment via Firebase Console
# Go to: https://console.firebase.google.com/project/duaab89-67c12/firestore/rules
# Copy content from firestore.rules and publish
```

### Step 2: Verify Environment Variables
Ensure your `.env.local` has Cloudflare R2 configuration:

```env
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=https://your-bucket.r2.dev
```

### Step 3: Test the System

1. **Start Development Server:**
   ```bash
   npm run dev
   ```

2. **Login as Admin:**
   - Navigate to `/auth`
   - Login with admin credentials

3. **Access Gallery Management:**
   - Go to `/admin`
   - Click on the "Gallery" tab

4. **Create Your First Album:**
   - Click "New Album Type"
   - Name: "Events" or "Memories"
   - Click "Create"

5. **Create a Collection:**
   - Go to "Collections" tab
   - Click "New Collection"
   - Select your album type
   - Name: "Reunion 2024" or similar
   - Click "Create"

6. **Upload Photos:**
   - Go to "Photos" tab
   - Click "Upload Photos"
   - Select your collection
   - Choose image files
   - Add captions (optional)
   - Click "Upload"

7. **View Public Gallery:**
   - Navigate to `/gallery`
   - Browse your albums and photos!

## 📁 Data Hierarchy

```
Album Type (Category)
  ├── Collection 1 (Album)
  │   ├── Photo 1
  │   ├── Photo 2
  │   └── Photo 3
  └── Collection 2 (Album)
      ├── Photo 1
      └── Photo 2
```

## 🎯 Example Setup

### Album Types
- Events
- Memories
- Reunions
- Activities

### Collections (under "Events")
- Annual Reunion 2024
- Family Day 2024
- Sports Day 2024
- Cultural Night 2024

### Photos
- Each collection contains multiple photos
- Photos stored in Cloudflare R2
- Automatic thumbnail generation (first photo)

## 🔑 Key Features

### Admin Features
- ✅ Create/Edit/Delete album types
- ✅ Create/Edit/Delete collections
- ✅ Upload multiple photos at once
- ✅ Add captions to photos
- ✅ Delete individual photos
- ✅ Filter and organize content
- ✅ Set display order

### Public Features
- ✅ Browse by album type (tabs)
- ✅ View collections as cards
- ✅ See photo count per collection
- ✅ Click to view all photos in collection
- ✅ Full-screen photo viewer
- ✅ Photo captions display
- ✅ Responsive design

## 🛠️ Troubleshooting

### Photos Not Uploading?
1. Check R2 credentials in `.env.local`
2. Verify R2 bucket exists and is accessible
3. Check file size (keep under 5MB per file)
4. Look at browser console for errors

### Can't See Gallery Tab in Admin?
1. Ensure you're logged in as admin
2. Check user_roles collection in Firestore
3. Verify role is set to "admin"

### Photos Not Displaying on Public Page?
1. Check if collection has photos
2. Verify R2_PUBLIC_URL is correct
3. Check browser console for CORS errors
4. Ensure Firestore rules are deployed

### Deletions Not Working?
1. Must be logged in as admin
2. Check browser console for errors
3. Verify Firebase admin permissions

## 📊 Current Implementation Status

✅ **Completed:**
- Firestore security rules updated
- Admin management interface
- Public gallery viewer
- All API routes (admin & public)
- Photo upload to R2
- Cascade delete functionality
- Documentation

## 🎨 Customization Tips

### Change Colors
Edit `components/admin/GalleryManagement.tsx` and `app/gallery/page.tsx` to customize Tailwind classes.

### Adjust Grid Layout
Modify grid classes in:
- Admin: `grid md:grid-cols-2 lg:grid-cols-3 gap-4`
- Public: `grid md:grid-cols-3 gap-4`

### Photo Upload Limits
Adjust validation in `app/api/admin/gallery/photos/route.ts`:
```typescript
// Add file size check
if (file.size > 5 * 1024 * 1024) {
  return NextResponse.json({ error: 'File too large' }, { status: 400 });
}
```

## 📚 Documentation Files

- `GALLERY_SYSTEM.md` - Complete user & technical guide
- `GALLERY_IMPLEMENTATION_SUMMARY.md` - Implementation details
- `QUICK_START.md` - This file

## 🎉 You're All Set!

The gallery system is fully functional and ready to use. Create some album types, add collections, upload photos, and share memories with your alumni community!

For detailed documentation, see `GALLERY_SYSTEM.md`.
