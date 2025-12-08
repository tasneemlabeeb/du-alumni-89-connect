# ⚡ QUICK FIX: Committee Photo Upload Error

## 🔴 The Error You're Seeing
```
FirebaseError: Firebase Storage: User does not have permission to access 'committee-photos/...'
```

## ✅ The Solution (2 Minutes)

### Step 1: Open Firebase Storage Rules
👉 **Click here:** https://console.firebase.google.com/project/duaab89-67c12/storage/rules

### Step 2: Delete Everything & Paste This
```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    
    function isAdmin() {
      return request.auth != null && 
             firestore.exists(/databases/(default)/documents/user_roles/$(request.auth.uid)) &&
             firestore.get(/databases/(default)/documents/user_roles/$(request.auth.uid)).data.role == 'admin';
    }
    
    match /committee-photos/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /committee-pdfs/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /events/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /news-images/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /gallery/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /blog-images/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /profile-photos/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

### Step 3: Click "Publish"
Wait for "Rules published successfully" message

### Step 4: Test
Go to your admin panel → Committee tab → Upload photo ✅

---

## 📱 Screenshot Guide

1. **Firebase Console** → Storage (left sidebar)
2. **Rules tab** (top navigation)
3. **Replace all text** with the rules above
4. **Click Publish** button (top right)

---

**Done!** Your committee photo uploads will now work.
