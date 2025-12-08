# Deploy Firestore Rules for Committee Management

## The Issue
You're seeing `FirebaseError: Missing or insufficient permissions` because the Firestore security rules for the committees collection haven't been deployed yet.

## Solution: Deploy Rules via Firebase Console

### Option 1: Firebase Console (Easiest)

1. **Go to Firebase Console**: https://console.firebase.google.com
2. **Select your project**: `duaab89-67c12` (or your project name)
3. **Navigate to Firestore Database**:
   - Click on "Firestore Database" in the left sidebar
   - Click on the "Rules" tab at the top
4. **Copy and paste the rules** from the file `firestore.rules` in your project
5. **Scroll down and find these new rules** (they should be at the bottom):

```javascript
// Committees collection
match /committees/{committeeId} {
  // Anyone can read committees
  allow read: if true;
  // Only admins can create, update, or delete committees
  allow create, update, delete: if isAdmin();
  
  // Committee members subcollection
  match /members/{memberId} {
    // Anyone can read committee members
    allow read: if true;
    // Only admins can create, update, or delete committee members
    allow create, update, delete: if isAdmin();
  }
}

// Contact messages collection
match /contact_messages/{messageId} {
  // Anyone can create contact messages
  allow create: if true;
  // Only admins can read, update, or delete messages
  allow read, update, delete: if isAdmin();
}
```

6. **Click "Publish"** button to deploy the rules

### Option 2: Use Firebase CLI (Alternative)

If you have Firebase CLI installed:

```bash
# Install Firebase CLI globally (if not installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not done)
firebase init firestore

# Deploy the rules
firebase deploy --only firestore:rules
```

## Verify Rules Are Working

After deploying the rules:

1. **Refresh your browser** on the committee page
2. **Check the console** - the permission error should be gone
3. **Try adding a committee** in the Admin panel

The committee page should now load properly without permission errors.

## Why This Happened

The committee feature is new, and the Firestore security rules that allow read/write access to the `committees` collection weren't deployed to your Firebase project yet. The rules exist in the `firestore.rules` file in your project, but they need to be published to Firebase to take effect.
