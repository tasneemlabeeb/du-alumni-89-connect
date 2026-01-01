# Registration & Approval Workflow Changes

## Overview
Implemented a comprehensive registration and approval system with the following requirements:
1. New users signup with email and phone number
2. Immediately redirected to profile page after signup
3. Must complete mandatory profile fields before accessing member features
4. Requires approval from TWO different admins before becoming an approved member
5. Gallery and Directory pages are protected and require both profile completion AND admin approval

## Changes Made

### 1. User Authentication & Signup Flow

#### `hooks/useAuth.tsx`
- **Added `profileComplete` state** to track whether user has filled mandatory fields
- **Updated `signUp` function** to accept phone number parameter
- **Enhanced user document creation** with new fields:
  - `phone_number`: User's contact number
  - `profile_complete`: Boolean flag for profile completion
  - `approval_count`: Number of admin approvals (0-2)
  - `approved_by_admins`: Array of admin UIDs who approved
- **Profile completion check** on auth state change:
  - Checks if mandatory fields are filled (fullName, nickName, department, hall, contactNo, bloodGroup)
  - Updates `profileComplete` state accordingly

#### `app/auth/page.tsx`
- **Added phone number field** to signup form with validation
- **Updated validation schema** to require phone number (min 10 characters)
- **Redirect to profile page** after successful signup instead of home page
- Changed success message to prompt profile completion

### 2. Profile Completion System

#### `app/profile/page.tsx`
- **Added mandatory field validation** before saving:
  - Full Name (required)
  - Nick Name (required)
  - Department (required)
  - Hall (required)
  - Contact Number (required)
  - Blood Group (required)
- **Visual indicators** for mandatory vs optional fields:
  - Red-highlighted section for missing mandatory fields
  - Separate section for optional fields
- **Validation on save**: Prevents saving without all mandatory fields filled
- **Auto-reload** after successful save to update profile completion status

#### `app/api/profile/route.ts`
- **Checks mandatory field completion** on profile save
- **Updates user document** with `profile_complete` status
- **Returns profile completion status** in response

### 3. Two-Admin Approval System

#### `app/api/admin/members/approve/route.ts`
- **Complete rewrite** of approval logic:
  - Checks if admin has already approved (prevents duplicate approvals)
  - Adds admin UID to `approved_by_admins` array
  - Increments `approval_count`
  - **Only approves member when**:
    - Profile is complete (all mandatory fields filled)
    - AND approval_count >= 2 (two different admins)
  - Deletes verification documents after full approval
  - Returns detailed approval status including count and profile completion

#### `components/admin/MemberManagement.tsx`
- **Added approval tracking fields** to Member interface:
  - `approval_count?: number`
  - `approved_by_admins?: string[]`
- **Display approval count** in UI for pending members
  - Shows "X/2 Approvals" badge next to pending status
  - Helps admins see approval progress

### 4. Protected Routes

#### `components/layout/ProtectedRoute.tsx`
- **Added `requireProfileComplete` prop** to check profile completion
- **Enhanced protection logic**:
  - Checks authentication (existing)
  - Checks admin role (existing)
  - **NEW**: Checks profile completion (if required)
  - **NEW**: Checks approval status (if required)
- **Improved user feedback**:
  - Shows profile incomplete message with link to complete profile
  - Shows pending approval message with count requirement (2 admins)
  - Different messages for different blocking conditions

#### `app/gallery/page.tsx`
- **Wrapped with ProtectedRoute**:
  - `approvedMemberOnly={true}`
  - `requireProfileComplete={true}`
- Split into wrapper component and content component for protection

#### `app/directory/page.tsx`
- **Wrapped with ProtectedRoute**:
  - `approvedMemberOnly={true}`
  - `requireProfileComplete={true}`
- Split into wrapper component and content component for protection

## User Flow

### New User Registration
1. User visits `/auth` and clicks "Create Account"
2. Fills signup form with:
   - Full Name
   - Email
   - Phone Number
   - Password
3. Clicks "Create Account"
4. Account created with status: `pending`, approval_count: `0`
5. **Automatically redirected to `/profile`**

### Profile Completion
6. User sees profile page with completion percentage
7. Mandatory fields highlighted in red if missing:
   - Full Name
   - Nick Name
   - Department
   - Hall
   - Contact Number
   - Blood Group
8. User fills mandatory fields (and optionally other fields)
9. Clicks "Save Profile"
10. If mandatory fields missing: Error toast shown
11. If all mandatory fields filled: 
    - Success toast shown
    - `profile_complete` set to `true` in database
    - Page reloads to update status

### Admin Approval Process
12. Admin 1 logs in and goes to Admin Panel > Member Management
13. Sees pending members with "0/2 Approvals" badge
14. Reviews member profile and clicks "Approve"
15. Member now shows "1/2 Approvals"
16. Admin 2 logs in and reviews same member
17. Admin 2 clicks "Approve"
18. Member status changes to "approved"
19. Verification documents deleted from storage
20. Member can now access protected features

### Accessing Protected Features
- User tries to access `/gallery` or `/directory`
- System checks:
  1. ✓ Is user authenticated?
  2. ✓ Is profile complete? (all mandatory fields)
  3. ✓ Is member approved? (2 admin approvals)
- If all checks pass: Access granted
- If profile incomplete: Shown message to complete profile
- If not approved: Shown message about pending approval (needs 2 admins)

## Database Schema Changes

### `users` Collection
```typescript
{
  email: string,
  full_name: string,
  phone_number: string,          // NEW
  role: 'user' | 'admin',
  approval_status: 'pending' | 'approved' | 'rejected',
  approval_count: number,         // NEW (0-2)
  approved_by_admins: string[],   // NEW (array of admin UIDs)
  profile_complete: boolean,      // NEW
  email_verified: boolean,
  created_at: string,
  updated_at: string,
  approved_at?: string
}
```

### `members` Collection
```typescript
{
  user_id: string,
  full_name: string,
  email: string,
  phone_number: string,           // NEW
  status: 'pending' | 'approved' | 'rejected',
  approval_count: number,         // NEW
  approved_by_admins: string[],   // NEW
  created_at: string,
  approved_at?: string
}
```

## Security Considerations

1. **Profile completion** checked server-side in approval API
2. **Admin verification** ensures only admins can approve
3. **Duplicate approval prevention** - same admin can't approve twice
4. **Document deletion** after approval to save storage
5. **Protected routes** check both client and server side (Firebase rules should also be updated)

## Testing Checklist

- [ ] New user can sign up with phone number
- [ ] User redirected to profile page after signup
- [ ] Mandatory fields validation works (prevents save without required fields)
- [ ] Profile completion status updates correctly
- [ ] First admin can approve pending member
- [ ] Same admin cannot approve twice (error shown)
- [ ] Second admin can approve and member status changes to approved
- [ ] Gallery page blocked for incomplete profile
- [ ] Gallery page blocked for unapproved members
- [ ] Directory page blocked for incomplete profile
- [ ] Directory page blocked for unapproved members
- [ ] Approved members with complete profile can access all features
- [ ] Admin panel shows approval count correctly

## Next Steps (Optional Enhancements)

1. **Email notifications** when approval status changes
2. **Admin dashboard** showing pending approvals needing second admin
3. **Profile completion progress bar** on all pages
4. **Firestore security rules** to enforce profile completion and approval checks
5. **Audit log** of which admins approved which members
