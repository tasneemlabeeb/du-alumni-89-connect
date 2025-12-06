# News Categories Implementation

## Overview
Added support for 4 news categories in the News/Events section:
- **Achievements** 🏆
- **Announcements** 📢
- **Media / Press** 📰
- **Alumni Stories** ✨

## Changes Made

### 1. Firestore Security Rules (`firestore.rules`)
- Added validation for the `category` field in the `news` collection
- Valid categories: `achievements`, `announcements`, `media_press`, `alumni_stories`
- Category validation enforced on CREATE and UPDATE operations
- Ensures data integrity at the database level

### 2. News API Endpoints (`app/api/admin/news/route.ts`)
- **POST endpoint**: Added category field with validation and default value (`announcements`)
- **PUT endpoint**: Added category field validation for updates
- Returns 400 error if invalid category is provided
- Category field is optional during updates (preserves existing value if not provided)

### 3. Admin UI Component (`components/admin/NewsEventManagement.tsx`)
- Added `category` field to `NewsItem` interface
- Updated news form state to include category field (defaults to `announcements`)
- Added category dropdown selector in the news creation/edit dialog
- Added category badge display in the news list view with emoji indicators
- Category badges use outlined variant for visual distinction

## Category Values

| Display Name     | Database Value  | Emoji |
|-----------------|----------------|-------|
| Achievements    | `achievements` | 🏆    |
| Announcements   | `announcements`| 📢    |
| Media / Press   | `media_press`  | 📰    |
| Alumni Stories  | `alumni_stories`| ✨    |

## Database Schema

```typescript
interface NewsItem {
  id: string;
  title: string;
  content: string;
  summary?: string;
  published: boolean;
  featured_image_url?: string;
  category?: string; // NEW: 'achievements' | 'announcements' | 'media_press' | 'alumni_stories'
  author_id: string;
  created_at: string;
  updated_at: string;
}
```

## Deployment Steps

### 1. Deploy Firestore Rules
```bash
npm run deploy-rules
```
or manually deploy via Firebase Console.

### 2. Deploy Application Code
Deploy the updated application code to your hosting platform (Vercel, etc.)

### 3. Data Migration (Optional)
If you have existing news items without a category, you may want to update them:

```javascript
// Run this in Firebase Console > Firestore > Query
// or create a migration script
const newsRef = db.collection('news');
const snapshot = await newsRef.where('category', '==', null).get();
snapshot.forEach(doc => {
  doc.ref.update({ category: 'announcements' });
});
```

## Frontend Display (Future Enhancement)

For the public-facing news page (`app/news/page.tsx`), you can now:
1. Filter news by category
2. Add category tabs/filters
3. Display category-specific sections
4. Show category badges on news cards

Example filtering:
```typescript
const achievementNews = news.filter(item => item.category === 'achievements');
const announcementNews = news.filter(item => item.category === 'announcements');
const mediaPressNews = news.filter(item => item.category === 'media_press');
const alumniStoriesNews = news.filter(item => item.category === 'alumni_stories');
```

## Testing

1. **Create News**: Go to Admin > News/Events > Add News
   - Select a category from the dropdown
   - Verify it saves correctly
   
2. **Edit News**: Click Edit on existing news
   - Category should display current value
   - Change category and verify update
   
3. **View List**: Check that category badges appear correctly
   - Each category should show the appropriate emoji and label

4. **Validation**: Try to create news via API with invalid category
   - Should return 400 error

## Notes

- Default category is "Announcements" for backward compatibility
- Existing news items without a category will need to be updated
- Category field is required in Firestore rules but optional in the API for updates
- Category is displayed as a badge in the admin interface for easy identification
