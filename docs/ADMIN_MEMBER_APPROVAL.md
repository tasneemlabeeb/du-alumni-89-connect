# Admin Member Approval System

## Overview
The DU Alumni 89 Connect platform now includes a comprehensive member approval system that allows administrators to review and approve/reject member applications before they gain full access to the platform.

## How It Works

### 1. Member Registration Flow
When a new user registers:
1. User creates an account with email and password
2. A member record is created in Firestore with `status: 'pending'`
3. User can log in but will see a "Membership Pending Approval" message
4. User can view limited content until approved

### 2. Admin Dashboard Access
Admins can access the member management system at:
- **URL:** `/admin`
- **Navigation:** Admin Panel → Member Approvals tab

### 3. Member Management Features

#### Viewing Members
The admin dashboard has three tabs:
- **Pending:** New members awaiting approval
- **Approved:** Members with full access
- **Rejected:** Members who were denied access

#### Member Information Displayed
For each member, you can view:
- Profile photo
- Full name and nickname
- Email address
- Contact number
- Department and faculty
- Current location
- Profession
- Application date
- Biography

#### Approving a Member
1. Navigate to the "Pending" tab
2. Review the member's information
3. Click the "Approve" button
4. Confirm the action in the dialog
5. Member gains full platform access immediately

#### Rejecting a Member
1. Navigate to the "Pending" tab
2. Review the member's information
3. Click the "Reject" button
4. Confirm the action in the dialog
5. Member is denied access to the platform

## API Endpoints

### Get Members
```
GET /api/admin/members?status={pending|approved|rejected}
```
- **Auth:** Requires admin token
- **Returns:** List of members with the specified status

### Approve Member
```
POST /api/admin/members/approve
Body: { memberId: string }
```
- **Auth:** Requires admin token
- **Action:** Changes member status to 'approved'
- **Records:** Approval timestamp and admin ID

### Reject Member
```
POST /api/admin/members/reject
Body: { memberId: string, reason?: string }
```
- **Auth:** Requires admin token
- **Action:** Changes member status to 'rejected'
- **Records:** Rejection timestamp, admin ID, and optional reason

## Database Structure

### Members Collection
```typescript
{
  id: string;              // Document ID (same as user_id)
  user_id: string;         // Firebase Auth UID
  full_name: string;       // Member's full name
  email: string;           // Member's email
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;      // ISO timestamp
  approved_at?: string;    // ISO timestamp (if approved)
  approved_by?: string;    // Admin user ID
  rejected_at?: string;    // ISO timestamp (if rejected)
  rejected_by?: string;    // Admin user ID
  rejection_reason?: string; // Optional rejection reason
}
```

### User Roles Collection
```typescript
{
  user_id: string;         // Firebase Auth UID
  role: 'admin' | 'member';
}
```

### Profiles Collection
```typescript
{
  userId: string;
  fullName: string;
  email: string;
  department: string;
  // ... other profile fields
}
```

## Protected Routes

The platform uses the `ProtectedRoute` component to control access:

- **Admin-only pages:** Require `adminOnly={true}` prop
- **Member pages:** Require `approvedMemberOnly={true}` prop
- **General auth:** Just wrap with `<ProtectedRoute>`

Example:
```tsx
<ProtectedRoute adminOnly={true}>
  <AdminPage />
</ProtectedRoute>
```

## Setting Up Admins

To grant admin access to a user:

1. Create a document in the `user_roles` collection:
   ```
   Collection: user_roles
   Document ID: (auto-generate)
   Fields:
     user_id: <Firebase Auth UID>
     role: "admin"
   ```

2. The user will automatically gain admin access on their next login

## Statistics Dashboard

The admin dashboard displays:
- **Total Members:** Count of all approved members
- **Pending Approvals:** Count of members awaiting review
- **News & Events:** Published articles count
- **Gallery Albums:** Photo collections count

## Security

- All admin API endpoints verify the user's admin status
- Firebase Admin SDK is used for server-side operations
- ID tokens are validated on each request
- Non-admin users receive 403 Forbidden errors

## Troubleshooting

### Members not appearing
- Ensure Firebase is properly configured
- Check browser console for errors
- Verify admin role is set in Firestore

### Cannot approve/reject
- Verify you have admin role in `user_roles` collection
- Check Firebase Admin credentials are set in environment variables
- Review API error messages in browser console

### Member still pending after approval
- Refresh the page
- Check Firestore to verify status was updated
- Member may need to log out and log back in

## Future Enhancements

Potential improvements:
- Email notifications to members on approval/rejection
- Bulk approval/rejection actions
- Advanced filtering and search
- Member activity logs
- Export member data to CSV
- Custom rejection reasons with templates
