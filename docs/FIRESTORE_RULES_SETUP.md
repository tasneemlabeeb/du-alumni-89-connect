# Firestore Security Rules Setup

## Quick Fix for "Missing or insufficient permissions" Error

The error you're seeing happens because Firestore has default security rules that block all access. You need to deploy the security rules to Firebase.

## Option 1: Deploy via Firebase Console (Easiest)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click on **Firestore Database** in the left sidebar
4. Click on the **Rules** tab at the top
5. Copy and paste the contents of `firestore.rules` file from this project
6. Click **Publish** button

## Option 2: Deploy via Firebase CLI

If you have Firebase CLI installed:

```bash
# Install Firebase CLI if you haven't
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not done)
firebase init firestore

# Deploy the rules
firebase deploy --only firestore:rules
```

## What These Rules Do

### User Roles (`user_roles` collection)
- ✅ Any authenticated user can read roles (needed to check if they're admin)
- ✅ Only admins can create/update/delete roles

### Members (`members` collection)
- ✅ Anyone can read approved members (for the directory)
- ✅ Users can read their own member record (even if pending)
- ✅ Users can create their own member record during sign up (status must be 'pending')
- ✅ Users can update their profile data (but cannot change their approval status)
- ✅ Only admins can approve/reject members

### Profiles (`profiles` collection)
- ✅ Anyone can read profiles of approved members
- ✅ Users can read and update their own profile
- ✅ Admins can read all profiles

### News & Events
- ✅ Anyone can read published news/events
- ✅ Only admins can create/update/delete news/events
- ✅ Admins can see unpublished drafts

### Event Registrations
- ✅ Users can create registrations for themselves
- ✅ Users can read their own registrations
- ✅ Admins can manage all registrations

## Testing the Rules

After deploying, test by:

1. Sign up with a new account
2. You should be able to:
   - Create your member record
   - Read your own member record
   - Update your profile
3. You should NOT be able to:
   - Change your approval status
   - Read other pending members
   - Create news/events

## Temporary Development Rules (NOT for production!)

If you just want to test quickly in development, you can use these permissive rules in the Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

⚠️ **WARNING**: These rules allow any authenticated user to read/write everything. Only use for development!

## Current Error Fix

The immediate error you're seeing is because:
1. A new user signs up
2. The app tries to read `user_roles` collection to check if they're admin
3. Firestore blocks this because no rules are deployed

Once you deploy the rules above, this error will disappear.
