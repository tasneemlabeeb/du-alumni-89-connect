# ✅ Storage Rules Updated & Deployed

## 🔄 What Changed

The storage rules now check **both** collections for admin status (matching your Firestore rules):
- `users/{uid}` collection
- `user_roles/{uid}` collection

This matches the pattern already working in your Firestore rules.

---

## 🚨 IMPORTANT: Clear Browser Cache

The error persists because your browser has cached the old authentication state. 

### Do This Now:

1. **Hard Refresh the Page:**
   - **Mac:** `Cmd + Shift + R`
   - **Windows:** `Ctrl + Shift + R`

2. **Or Clear All Cache:**
   - Open DevTools (F12)
   - Right-click the refresh button
   - Select "Empty Cache and Hard Reload"

3. **Or Log Out and Back In:**
   - Log out from admin panel
   - Close the tab
   - Open new tab: http://localhost:3000/auth/login
   - Log in again as `admin@duaab89.com`

---

## 🧪 Test Again

After clearing cache:

1. Go to: **http://localhost:3000/admin**
2. Click **Committee** tab
3. Try uploading a photo
4. **Should work now!** ✅

---

## 🔍 If Still Not Working

Run this to check your user document:

```bash
# Check if your admin user is in Firestore
npx tsx -e "
import { doc, getDoc } from 'firebase/firestore';
import { db } from './lib/firebase/config.js';

const uid = 'bCuW2JEWuqZ40X5kbtXGaPb0xfG2'; // Your UID from error logs

const checkAdmin = async () => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  const roleDoc = await getDoc(doc(db, 'user_roles', uid));
  
  console.log('users collection:', userDoc.exists() ? userDoc.data() : 'NOT FOUND');
  console.log('user_roles collection:', roleDoc.exists() ? roleDoc.data() : 'NOT FOUND');
};

checkAdmin();
"
```

---

## 📝 Rules Deployed

```javascript
function isAdmin() {
  return request.auth != null && (
    // Check users collection
    (firestore.exists(/databases/(default)/documents/users/$(request.auth.uid)) &&
     firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin') ||
    // OR check user_roles collection
    (firestore.exists(/databases/(default)/documents/user_roles/$(request.auth.uid)) &&
     firestore.get(/databases/(default)/documents/user_roles/$(request.auth.uid)).data.role == 'admin')
  );
}
```

This now matches your working Firestore rules! 🎉
