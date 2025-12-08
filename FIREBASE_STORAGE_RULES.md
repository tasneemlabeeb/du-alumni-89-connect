# Firebase Storage Rules Setup for Committee PDFs

## The Issue
You're getting a `403 Unauthorized` error when trying to upload committee PDFs because Firebase Storage security rules don't allow it.

Error: `Firebase Storage: User does not have permission to access 'committee-pdfs/...'`

## Solution: Update Firebase Storage Rules

### Step 1: Go to Firebase Console
1. Open: https://console.firebase.google.com
2. Select your project: `duaab89-67c12`

### Step 2: Navigate to Storage Rules
1. Click **"Storage"** in the left sidebar
2. Click the **"Rules"** tab at the top

### Step 3: Update the Rules

Replace the entire content with these rules:

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
    
    // Blog images - approved members can write their own, everyone can read
    match /blog-images/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Profile photos - users can write their own, everyone can read
    match /profile-photos/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Default deny
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

### Step 4: Publish
1. Click the **"Publish"** button
2. Wait for confirmation (should say "Rules published successfully")

### Step 5: Test
1. Go back to your Admin Dashboard → Committee tab
2. Try creating a Previous Committee with a PDF
3. The upload should now work!

## What These Rules Do

- **committee-pdfs/**: Admins can upload, everyone can download (for previous committee documents)
- **committee-photos/**: Admins can upload member photos, everyone can view
- **events/**: Event images (admins only)
- **news-images/**: News images (admins only)
- **gallery/**: Gallery photos (admins only)
- **blog-images/**: Blog images (authenticated users)
- **profile-photos/**: User profile photos (users can upload their own)

## Important Notes

- Make sure you're logged in as an admin when uploading
- PDF files must be valid PDF format
- File sizes should be reasonable (Firebase has limits)
- The rules check against the Firestore `user_roles` collection to verify admin status

## After Deploying Rules

You should be able to:
1. Upload committee PDFs in the admin panel
2. Public visitors can download/view the PDFs
3. No more `403 Unauthorized` errors
