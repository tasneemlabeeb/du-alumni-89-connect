# Deploy Firebase Storage Rules - Fix Committee Photo Upload Error

## The Problem
You're getting this error when uploading committee member photos:
```
FirebaseError: Firebase Storage: User does not have permission to access 'committee-photos/...'. (storage/unauthorized)
```

This happens because Firebase Storage security rules haven't been set up yet.

## Quick Fix: Deploy Storage Rules via Firebase Console

### Step 1: Go to Firebase Console
1. Open: **https://console.firebase.google.com**
2. Select your project: **duaab89-67c12**

### Step 2: Navigate to Storage Rules
1. Click **"Storage"** in the left sidebar (under "Build" section)
2. Click the **"Rules"** tab at the top

### Step 3: Copy and Paste the Rules

Replace everything in the editor with this:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
             firestore.exists(/databases/(default)/documents/user_roles/$(request.auth.uid)) &&
             firestore.get(/databases/(default)/documents/user_roles/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Committee photos - admins can write, everyone can read
    match /committee-photos/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Committee PDFs - admins can write, everyone can read
    match /committee-pdfs/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Event images - admins can write, everyone can read
    match /events/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // News images - admins can write, everyone can read
    match /news-images/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Gallery photos - admins can write, everyone can read
    match /gallery/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Blog images - authenticated users can write, everyone can read
    match /blog-images/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Profile photos - users can write their own, everyone can read
    match /profile-photos/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Default deny all other paths
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

### Step 4: Publish
1. Click the **"Publish"** button at the top right
2. Wait for confirmation: "Rules published successfully"

### Step 5: Test
1. Go back to your app: http://localhost:3000/admin
2. Navigate to the **Committee** tab
3. Try adding a committee member photo
4. It should work now! ✅

## Alternative: Deploy via Firebase CLI

If you have Firebase CLI installed, you can deploy from your terminal:

```bash
# Make sure you're logged in
firebase login

# Initialize storage (if not already done)
firebase init storage

# Deploy storage rules
firebase deploy --only storage
```

## What These Rules Do

| Path | Who Can Read | Who Can Write |
|------|--------------|---------------|
| `committee-photos/` | Everyone | Admins only |
| `committee-pdfs/` | Everyone | Admins only |
| `events/` | Everyone | Admins only |
| `news-images/` | Everyone | Admins only |
| `gallery/` | Everyone | Admins only |
| `blog-images/` | Everyone | Authenticated users |
| `profile-photos/{userId}/` | Everyone | Owner only |

## Security Features

✅ **Admin-only uploads** for committee, events, news, and gallery  
✅ **Public read access** so visitors can see images  
✅ **User-specific** profile photo access  
✅ **Authenticated users** can upload blog images  
✅ **Default deny** for all other paths (security by default)

---

**Need help?** Check the Firebase Console for error messages or test the rules using the Firebase Storage Rules Playground.
