# Test User Credentials

## Admin User

**Status:** ✅ Created Successfully

### Login Credentials
- **Email:** `admin@duaab89.com`
- **Password:** `Admin@123456`
- **User ID:** `bCuW2JEWuqZ40X5kbtXGaPb0xfG2`

### Permissions
- ✅ Admin privileges
- ✅ Approved member status
- ✅ Full access to all features

### Firestore Collections Created
1. **members** collection
   - Document ID: `bCuW2JEWuqZ40X5kbtXGaPb0xfG2`
   - Status: `approved`
   - Batch: `1989`

2. **user_roles** collection
   - Role: `admin`
   - User ID: `bCuW2JEWuqZ40X5kbtXGaPb0xfG2`

## How to Test

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the auth page:**
   Open http://localhost:3000/auth in your browser

3. **Login with the credentials above**

4. **Verify admin access:**
   - Check if you can access admin-only features
   - Verify member status shows as "approved"
   - Test protected routes

## Creating Additional Users

To create more test users, modify and run:
```bash
npm run create-test-user
```

Or sign up through the UI at `/auth` (users will be pending approval by default).

## Important Notes

⚠️ **Security:** These are test credentials. Do not use them in production.

⚠️ **Database:** This user is created in your Firebase project `duaab89-67c12`.

🔄 **Reset:** To delete this user, use the Firebase Console or create a delete script.
