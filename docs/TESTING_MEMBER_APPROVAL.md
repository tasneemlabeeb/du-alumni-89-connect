# Quick Start: Testing the Member Approval System

## Prerequisites

1. Firebase project set up with:
   - Authentication enabled
   - Firestore database created
   - Admin SDK credentials configured

2. Environment variables set in `.env.local`:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   FIREBASE_ADMIN_PROJECT_ID=your_project_id
   FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email
   FIREBASE_ADMIN_PRIVATE_KEY=your_private_key
   ```

## Step-by-Step Testing Guide

### 1. Create an Admin User

First, you need at least one admin user to test the approval system.

**Option A: Using Firebase Console**
1. Go to Firebase Console → Firestore Database
2. Create a new collection: `user_roles`
3. Add a document with auto-generated ID:
   ```
   {
     "user_id": "YOUR_FIREBASE_AUTH_UID",
     "role": "admin"
   }
   ```

**Option B: Manually via Firebase CLI or script**
```javascript
// Add this to a one-time setup script
const admin = require('firebase-admin');
admin.initializeApp();

admin.firestore().collection('user_roles').add({
  user_id: 'YOUR_USER_ID_HERE',
  role: 'admin'
});
```

### 2. Create Test Members

**Create a test user:**
1. Go to `/auth` page
2. Click "Sign Up" tab
3. Fill in:
   - Full Name: Test User
   - Email: testuser@example.com
   - Password: Test123!
4. Click "Sign Up"
5. User will be created with `status: 'pending'`

**Create profile (optional but recommended):**
1. After signup, go to `/profile`
2. Fill out the profile form with test data
3. Save the profile

### 3. Test Admin Dashboard

1. **Log in as admin:**
   - Go to `/auth`
   - Log in with your admin account

2. **Navigate to admin panel:**
   - Go to `/admin`
   - You should see the admin dashboard

3. **View pending members:**
   - Click on "Member Approvals" tab
   - You should see the test user in the "Pending" tab

4. **Test approval:**
   - Click "Approve" button on test user
   - Confirm in the dialog
   - Check that:
     - Success toast appears
     - Member moves to "Approved" tab
     - Pending count decreases

5. **Test rejection:**
   - Create another test user
   - Click "Reject" button
   - Confirm in the dialog
   - Verify member appears in "Rejected" tab

### 4. Verify Member Access

**Test as pending member:**
1. Log in as a pending member
2. Try to access protected pages
3. You should see: "Membership Pending Approval" message

**Test as approved member:**
1. Log in as an approved member
2. Access all member features
3. Pages should load normally

**Test as rejected member:**
1. Log in as a rejected member
2. Should be restricted from accessing member content

### 5. Check Database Updates

In Firebase Console → Firestore:

**Members collection should show:**
```javascript
// Approved member
{
  user_id: "abc123",
  full_name: "Test User",
  email: "test@example.com",
  status: "approved",
  created_at: "2024-11-21T...",
  approved_at: "2024-11-21T...",
  approved_by: "admin_user_id"
}

// Rejected member
{
  user_id: "def456",
  full_name: "Test User 2",
  email: "test2@example.com",
  status: "rejected",
  created_at: "2024-11-21T...",
  rejected_at: "2024-11-21T...",
  rejected_by: "admin_user_id"
}
```

## Common Issues & Solutions

### Issue: "No members found" in admin dashboard

**Solutions:**
1. Check that test users are actually registered
2. Verify Firebase connection (check console for errors)
3. Ensure admin credentials are correct in `.env.local`
4. Check that members collection exists in Firestore

### Issue: Cannot approve/reject members

**Solutions:**
1. Verify you're logged in as an admin
2. Check `user_roles` collection has admin role for your user
3. Check browser console for API errors
4. Verify Firebase Admin SDK credentials are set

### Issue: Member still shows as pending after approval

**Solutions:**
1. Refresh the page
2. Check Firestore to see if status was updated
3. Clear browser cache
4. Have member log out and log back in

### Issue: API returns 401 Unauthorized

**Solutions:**
1. Verify Firebase Auth token is being sent
2. Check that user is logged in
3. Ensure ID token hasn't expired (log out and log back in)

### Issue: API returns 403 Forbidden

**Solutions:**
1. Verify user has admin role in `user_roles` collection
2. Check that `user_id` in `user_roles` matches Firebase Auth UID
3. Ensure `role` field is exactly "admin" (case-sensitive)

## Development Workflow

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Open admin dashboard:**
   ```
   http://localhost:3000/admin
   ```

3. **Check browser console for errors**

4. **Use React DevTools to inspect components**

5. **Monitor Firestore in Firebase Console**

## Production Checklist

Before deploying to production:

- [ ] Firebase Admin credentials are secure
- [ ] Environment variables are set in production
- [ ] Admin users are properly configured
- [ ] Test the full approval workflow
- [ ] Verify email notifications (if implemented)
- [ ] Check mobile responsiveness
- [ ] Test with real user data
- [ ] Set up monitoring/logging
- [ ] Review security rules in Firestore

## Next Steps

After successful testing:

1. Deploy to production
2. Train admins on using the system
3. Set up email notifications (future enhancement)
4. Monitor member approval metrics
5. Gather feedback from admins
6. Implement additional features as needed

## Support

For issues or questions:
- Check the documentation in `/docs`
- Review Firebase logs
- Check browser console for errors
- Verify Firestore security rules
