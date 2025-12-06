# Gallery System Documentation

## Overview
The gallery system allows admins to organize photos in a hierarchical structure:
- **Album Types** → **Collections** → **Photos**

For example:
- Album Type: "Events"
  - Collection: "Reunion 2024"
    - Photo 1, Photo 2, Photo 3...
  - Collection: "Family Day 2024"
    - Photo 1, Photo 2, Photo 3...

## Admin Features

### Access
Navigate to the Admin Dashboard and click on the **Gallery** tab.

### Album Types
Album types are top-level categories that help organize collections.

**Creating an Album Type:**
1. Go to the "Album Types" tab
2. Click "New Album Type"
3. Enter:
   - Name (required): e.g., "Events", "Memories", "Reunions"
   - Description (optional): Brief description
   - Display Order: Controls sorting order (lower numbers appear first)
4. Click "Create"

**Editing/Deleting:**
- Click the edit icon to modify
- Click the trash icon to delete (WARNING: This will delete all collections and photos under this album type)

### Collections
Collections are albums that belong to an album type and contain photos.

**Creating a Collection:**
1. Go to the "Collections" tab
2. Click "New Collection"
3. Enter:
   - Album Type (required): Select the parent album type
   - Name (required): e.g., "Reunion 2024", "Summer Picnic"
   - Description (optional): Brief description
   - Display Order: Controls sorting order within the album type
4. Click "Create"

**Editing/Deleting:**
- Use filters to find collections by album type
- Click the edit icon to modify
- Click the trash icon to delete (WARNING: This will delete all photos in this collection)

### Photos
Upload and manage photos within collections.

**Uploading Photos:**
1. Go to the "Photos" tab
2. Click "Upload Photos"
3. Select:
   - Collection (required): Choose which collection to add photos to
   - Photos (required): Select one or multiple image files
   - Captions (optional): Add captions for each photo
4. Click "Upload X Photo(s)"

**Managing Photos:**
- Filter by collection to view photos
- Click the trash icon on a photo to delete it
- Photos are automatically stored in Cloudflare R2 storage

## Public Gallery

### User Experience
Users can browse the gallery at `/gallery`:
1. View album types as tabs at the top
2. See all collections as cards with thumbnails and photo counts
3. Click a collection to view all photos in a modal
4. Click a photo to view it full-screen with caption

### Features
- Responsive grid layout
- Image lightbox for full-screen viewing
- Photo captions display
- Photo count per collection
- Organized by album types

## Technical Details

### Firestore Structure
```
album_types/
  {albumTypeId}/
    - name: string
    - description: string
    - order: number
    - createdAt: timestamp
    - updatedAt: timestamp

collections/
  {collectionId}/
    - albumTypeId: string (reference)
    - name: string
    - description: string
    - photoCount: number
    - order: number
    - createdAt: timestamp
    - updatedAt: timestamp

photos/
  {photoId}/
    - collectionId: string (reference)
    - url: string (R2 public URL)
    - caption: string
    - order: number
    - createdAt: timestamp
    - updatedAt: timestamp
```

### Storage
Photos are stored in Cloudflare R2 under the path:
```
gallery/{collectionId}/{timestamp}-{random}.{extension}
```

### API Routes

**Admin Routes (require admin authentication):**
- `POST /api/admin/gallery/album-types` - Create album type
- `PUT /api/admin/gallery/album-types/[id]` - Update album type
- `DELETE /api/admin/gallery/album-types/[id]` - Delete album type
- `GET /api/admin/gallery/album-types` - List all album types

- `POST /api/admin/gallery/collections` - Create collection
- `PUT /api/admin/gallery/collections/[id]` - Update collection
- `DELETE /api/admin/gallery/collections/[id]` - Delete collection
- `GET /api/admin/gallery/collections` - List all collections

- `POST /api/admin/gallery/photos` - Upload photo (multipart/form-data)
- `DELETE /api/admin/gallery/photos/[id]` - Delete photo
- `GET /api/admin/gallery/photos` - List all photos

**Public Routes (no authentication):**
- `GET /api/gallery/album-types` - List all album types
- `GET /api/gallery/collections?albumTypeId={id}` - List collections (optionally filtered)
- `GET /api/gallery/photos?collectionId={id}` - List photos in a collection

### Security
- Only admins can create, update, or delete gallery content
- All users can view published gallery content
- Photos are publicly accessible via R2 URLs
- Firestore security rules enforce admin-only writes

## Best Practices

### Organizing Content
1. Create album types first (e.g., "Events", "Memories")
2. Create collections under appropriate album types
3. Upload photos to collections
4. Use meaningful names and descriptions
5. Use display order to control sorting

### Photo Management
- Upload photos in batches to save time
- Add captions to provide context
- Delete unused photos to save storage
- First photo in a collection becomes the thumbnail

### Performance
- Avoid uploading extremely large image files
- Recommended: Images under 5MB each
- Collections with 20-50 photos work best for viewing
- Use descriptive names for better organization

## Troubleshooting

**Upload Fails:**
- Check Cloudflare R2 credentials in environment variables
- Ensure file is a valid image format
- Check file size (very large files may timeout)

**Photos Not Showing:**
- Verify R2 bucket is publicly accessible
- Check R2_PUBLIC_URL environment variable
- Ensure photos collection has correct collectionId

**Can't Delete Collection:**
- Must be admin user
- Check browser console for error messages
- Deleting a collection deletes all its photos

## Future Enhancements
- Bulk photo upload with drag-and-drop
- Photo editing (crop, resize)
- Photo ordering within collections
- Search and filter photos
- Download entire collection
- Photo metadata (EXIF data)
- Video support
- Private/members-only galleries
