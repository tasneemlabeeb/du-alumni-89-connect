# Committee Management System

## Overview
The committee management system allows admins to create and manage different types of committees with their members. The system supports three types of committees:
- **Current Committee**: Active committees (Executive, Standing, etc.)
- **Previous Committee**: Historical committees by year (2014-2015, 2015-2016, etc.)
- **Honours Board**: Honorary positions (Presidents, Secretaries, etc.)

## Features

### Admin Interface
Admins can access the committee management through the Admin Dashboard → Committee tab.

#### Creating Committees
1. Click "Add Committee" button
2. Fill in:
   - **Committee Name**: e.g., "Executive Committee", "2014-2015", "Presidents"
   - **Type**: Select from Current Committee, Previous Committee, or Honours Board
   - **Year**: Optional field for specifying year ranges (useful for previous committees)
3. Click "Create Committee"

#### Managing Committee Members
1. Select a committee from the left sidebar
2. Click "Add Member" to add new members
3. Fill in member details:
   - **Name**: Full name of the member (required)
   - **Position**: Role in the committee (required), e.g., "President", "General Secretary"
   - **Department**: Academic department (optional)
   - **Photo**: Upload member photo (optional)
4. Click "Add Member" to save

#### Editing Members
- Click the edit icon on any member card
- Update the information
- Upload a new photo if needed
- Click "Update Member"

#### Deleting Members
- Click the trash icon on any member card
- Confirm deletion

#### Deleting Committees
- Click the trash icon next to the committee name in the sidebar
- Confirm deletion (this will also delete all members in that committee)

### Public Display
The committee page displays:
- Hero section with navigation breadcrumbs
- Search functionality to filter members
- Three main tabs: Current Committee, Previous Committee, Honours Board
- Committee selector buttons that dynamically load based on the active tab
- Grid layout of committee members with photos, names, positions, and departments

## Database Structure

### Firestore Collections

#### `committees` Collection
```
committees/{committeeId}
  - name: string
  - type: 'current' | 'previous' | 'honours'
  - year: string (optional)
  - order: number
  - createdAt: timestamp
```

#### `committees/{committeeId}/members` Subcollection
```
committees/{committeeId}/members/{memberId}
  - name: string
  - position: string
  - department: string
  - photoURL: string
  - order: number
  - createdAt: timestamp
```

### Firebase Storage
Committee member photos are stored in:
```
committee-photos/{committeeId}/{timestamp}_{filename}
```

## Security Rules
The Firestore security rules have been updated to:
- Allow public read access to all committees and their members
- Restrict write operations (create, update, delete) to admin users only

## Example Committee Types

### Current Committee
- Executive Committee
- Standing Committee
- Automation Committee
- Finance & Audit Committee
- Fund Raising Committee
- Publication Committee
- Advisory Committee

### Previous Committee
- 2014-2015
- 2015-2016
- 2016-2024

### Honours Board
- Presidents
- Secretaries

## Usage Flow

### For Admins
1. Navigate to Admin Dashboard
2. Go to "Committee" tab
3. Create committees for each type (Executive, Standing, etc.)
4. Add members to each committee with their photos and details
5. Members are automatically displayed on the public committee page

### For Public Visitors
1. Visit the Committee page from the main navigation
2. Use the search bar to find specific members
3. Click on different tabs (Current/Previous/Honours) to view different committee types
4. Click on specific committees to view their members
5. View member details including photo, name, position, and department

## Deployment Notes

### Deploy Firestore Rules
After setting up the committee system, deploy the updated Firestore security rules:

```bash
npm run deploy-rules
```

Or manually:
```bash
firebase deploy --only firestore:rules
```

### Storage Rules
Ensure Firebase Storage rules allow:
- Admin users to upload photos
- Public read access to committee photos

## Tips
- Upload high-quality member photos for best display (square/portrait format recommended)
- Use consistent position titles across committees
- Keep committee names concise and descriptive
- Use the order field to control the display sequence (automatically assigned)
- Previous committees can use year ranges in the name or year field for easy identification
