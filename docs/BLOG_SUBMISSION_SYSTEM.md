# Blog Submission & Approval System

## Overview
The blog system allows approved members to submit Campus Memories, Published Articles, and Talent Hub posts that require admin approval before publication.

## Features

### For Approved Members
- **Submit Blog Posts**: Approved members can submit three types of blog posts:
  - **Campus Memories**: Share memories from DU days
  - **Published Articles**: Share articles, research, or professional insights
  - **Talent Hub**: Showcase creative work, achievements, or projects
- **Form Fields**:
  - Title (required)
  - Category (required)
  - Excerpt/Summary (required, max 300 characters)
  - Full Content (required)
  - Featured Image URL (optional)
- **Submission Status**: Posts are submitted with 'pending' status for admin review

### For Admins
- **Review Submissions**: View all pending, approved, and rejected blog posts
- **Approve Posts**: Approve and publish blog posts immediately
- **Reject Posts**: Reject posts with a reason that the author can see
- **Delete Posts**: Remove blog posts permanently
- **View Details**: Preview full post content before approving

### For All Users
- **Browse Blog**: View all approved and published blog posts
- **Filter by Category**: Filter posts by Campus Memories, Published Articles, or Talent Hub
- **Search**: Search posts by title, excerpt, or author name
- **Read Full Posts**: Click "Read more" to view complete blog posts

## Technical Implementation

### Database Structure (Firestore)
Collection: `blog_posts`
```typescript
{
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: 'campus-memories' | 'published-articles' | 'talent-hub';
  featured_image_url?: string;
  author_id: string;
  author_name: string;
  author_department?: string;
  status: 'pending' | 'approved' | 'rejected';
  published: boolean;
  created_at: string;
  updated_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
}
```

### API Endpoints

#### Member Endpoints
- `POST /api/blog/submit` - Submit a new blog post (approved members only)
- `GET /api/blog/posts` - Fetch approved and published blog posts
  - Query params: `category` (optional)
- `GET /api/blog/posts/[id]` - Fetch a single blog post by ID

#### Admin Endpoints
- `GET /api/admin/blog` - Fetch all blog posts (all statuses)
  - Query params: `status` (optional: pending, approved, rejected)
- `PUT /api/admin/blog?id={postId}` - Approve or reject a blog post
  - Body: `{ action: 'approve' | 'reject', rejection_reason?: string }`
- `DELETE /api/admin/blog?id={postId}` - Delete a blog post

### Components

#### For Members
- `BlogSubmissionForm` (`components/blog/BlogSubmissionForm.tsx`)
  - Form to submit blog posts
  - Category selection
  - Rich text input for content
  - Image URL input

#### For Admins
- `BlogManagement` (`components/admin/BlogManagement.tsx`)
  - Tabbed interface (Pending, Approved, Rejected)
  - View post details
  - Approve/reject with reason
  - Delete posts

#### For Public
- `BlogPage` (`app/blog/page.tsx`)
  - Category tabs
  - Search functionality
  - Card-based post listing
  - Submit button for approved members
- `BlogPostPage` (`app/blog/[id]/page.tsx`)
  - Full post view
  - Author information
  - Related posts section (placeholder)

## Workflow

### Submission Workflow
1. Approved member clicks "Submit Your Story" on blog page
2. Fills out the submission form with title, category, excerpt, content, and optional image
3. Submits for review - post is created with `status: 'pending'` and `published: false`
4. Member receives confirmation that post is under review

### Admin Review Workflow
1. Admin navigates to Admin Dashboard → Blog Posts tab
2. Views pending posts in the "Pending" tab
3. Clicks "View" to preview full post content
4. Options:
   - **Approve**: Sets `status: 'approved'`, `published: true`, adds `reviewed_by` and `reviewed_at`
   - **Reject**: Sets `status: 'rejected'`, `published: false`, adds rejection reason
   - **Delete**: Permanently removes the post

### Publication Workflow
1. When admin approves a post:
   - Post status changes to 'approved'
   - Post is published (visible on blog page)
   - Post appears in the appropriate category
2. When admin rejects a post:
   - Post status changes to 'rejected'
   - Author can see rejection reason (future enhancement: notification)

## Security & Permissions

### Member Submission
- Only users with `role: 'approved_member'` can submit blog posts
- Verified via Firebase Auth token and user_roles collection

### Admin Management
- Only users with `role: 'admin'` can:
  - View all posts (pending, approved, rejected)
  - Approve/reject posts
  - Delete posts
- Verified via Firebase Auth token and users collection

### Public Access
- Anyone can view approved and published posts
- No authentication required for reading blog posts

## Future Enhancements
- [ ] Rich text editor (WYSIWYG) for content formatting
- [ ] Image upload functionality (Cloudflare R2 integration)
- [ ] Member dashboard to track their submission status
- [ ] Email notifications for approval/rejection
- [ ] Comments system on blog posts
- [ ] Like/reaction system
- [ ] Related posts algorithm
- [ ] Tags/keywords for better categorization
- [ ] Author profile pages
- [ ] Draft saving functionality
- [ ] Revision history

## Testing

### Manual Testing Steps
1. **As Approved Member**:
   - Navigate to /blog
   - Click "Submit Your Story"
   - Fill out the form with all required fields
   - Submit and verify success message
   - Check that post doesn't appear on blog page (pending approval)

2. **As Admin**:
   - Navigate to /admin
   - Go to "Blog Posts" tab
   - Verify pending post appears
   - Click "View" to preview
   - Approve the post
   - Verify it moves to "Approved" tab

3. **As Public User**:
   - Navigate to /blog
   - Verify approved post appears
   - Test category filtering
   - Test search functionality
   - Click "Read more" and verify full post view

### API Testing
```bash
# Test submission (requires valid auth token)
curl -X POST http://localhost:3000/api/blog/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Post",
    "category": "campus-memories",
    "excerpt": "This is a test",
    "content": "Full test content here"
  }'

# Test fetching posts
curl http://localhost:3000/api/blog/posts

# Test category filter
curl http://localhost:3000/api/blog/posts?category=campus-memories
```

## Firestore Rules
Add to `firestore.rules`:
```
match /blog_posts/{postId} {
  // Anyone can read approved and published posts
  allow read: if resource.data.status == 'approved' && resource.data.published == true;
  
  // Approved members can create posts
  allow create: if request.auth != null && 
    get(/databases/$(database)/documents/user_roles/$(request.auth.uid)).data.role == 'approved_member';
  
  // Admins can read, update, and delete all posts
  allow read, update, delete: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

## Deployment Checklist
- [ ] Update Firestore rules
- [ ] Create composite indexes if needed (category + status + created_at)
- [ ] Test all API endpoints in production
- [ ] Verify admin permissions
- [ ] Test member submission flow
- [ ] Verify public blog page access
- [ ] Check mobile responsiveness
- [ ] Test image loading and fallbacks

## Support
For issues or questions about the blog system, please contact the admin team.
