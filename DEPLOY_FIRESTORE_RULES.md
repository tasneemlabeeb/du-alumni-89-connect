# How to Deploy Firestore Rules

The Firestore rules have been updated to allow public read access to events (so they show on the events page).

## Option 1: Deploy via Firebase Console (Easiest)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **duaab89-67c12**
3. Click on **Firestore Database** in the left menu
4. Click on the **Rules** tab at the top
5. Copy the content from `firestore.rules` file in this project
6. Paste it into the Firebase Console editor
7. Click **Publish** button

## Option 2: Deploy via Firebase CLI

If you have Firebase CLI installed:

```bash
# Login to Firebase
firebase login

# Initialize Firebase in this project (if not already done)
firebase init firestore

# Deploy the rules
firebase deploy --only firestore:rules
```

## What Changed

The events collection rule was updated from:
```
allow read: if resource.data.published == true;
```

To:
```
allow read: if true; // Allow all reads for now
```

This allows anyone (even unauthenticated users) to read events. The filtering for published events happens on the client side in the query.

## After Deployment

1. Refresh your browser
2. Go to the News & Events page
3. Events should now appear!
