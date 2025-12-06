# Gallery Error Troubleshooting

## The error "Failed to create album type" can be caused by:

### 1. ⚠️ **Firestore Rules Not Deployed** (MOST LIKELY)
The `album_types`, `collections`, and `photos` collections are new. Their security rules exist in your local `firestore.rules` file but haven't been deployed to Firebase yet.

**Solution:**
1. Go to: https://console.firebase.google.com/project/duaab89-67c12/firestore/rules
2. Copy the entire content from `firestore.rules` 
3. Paste in the Firebase Console editor
4. Click "Publish"

OR use Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

### 2. 🔐 **Admin Permissions Issue**
Verify you're logged in as an admin user.

**Check in Firestore:**
1. Go to: https://console.firebase.google.com/project/duaab89-67c12/firestore/data
2. Open `user_roles` collection
3. Find your user ID
4. Verify `role` field is set to `"admin"`

### 3. 🔑 **Firebase Admin SDK Credentials**
Check your `.env.local` has:
```env
FIREBASE_ADMIN_PROJECT_ID=duaab89-67c12
FIREBASE_ADMIN_CLIENT_EMAIL=...
FIREBASE_ADMIN_PRIVATE_KEY=...
```

### 4. 🌐 **Network/CORS Issue**
Check browser console (F12) for:
- Network errors
- CORS errors
- 401/403 status codes

### 5. 📝 **Check Server Logs**
Look at your terminal where `npm run dev` is running for error messages.

## Debugging Steps

1. **Open Browser Console** (F12)
2. **Try creating an album type**
3. **Check the Network tab** for the API call to `/api/admin/gallery/album-types`
4. **Look at the Response** to see the actual error message
5. **Check Console logs** for any JavaScript errors

## Quick Test

Try this in your browser console while on the admin page:
```javascript
// Get auth token
const user = firebase.auth().currentUser;
const token = await user.getIdToken();

// Test API call
const response = await fetch('/api/admin/gallery/album-types', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Test Album',
    description: 'Test',
    order: 0
  })
});

const data = await response.json();
console.log('Status:', response.status);
console.log('Response:', data);
```

## Most Likely Fix

**Deploy the Firestore rules now:**
1. Visit: https://console.firebase.google.com/project/duaab89-67c12/firestore/rules
2. Paste rules from `firestore.rules`
3. Publish

This will allow the admin API to write to the new gallery collections.
