# Cloud Storage Setup Guide

## Overview
The DUAAB89 portal supports two cloud storage providers for photos:
- **Backblaze B2** (Recommended - cheaper, has free tier)
- **Cloudflare R2** (Good for high-traffic sites)

> **💡 Recommendation**: Use **Backblaze B2** for this project due to:
> - 10GB/month free storage
> - Lower costs ($0.005/GB vs $0.015/GB)
> - Generous free egress allowance
> 
> See [BACKBLAZE_B2_SETUP.md](./BACKBLAZE_B2_SETUP.md) for Backblaze setup instructions.

---

# Cloudflare R2 Storage Setup

This guide covers Cloudflare R2 setup. For Backblaze B2 (recommended), see the link above.

## Prerequisites
- Cloudflare account
- Access to R2 storage

## Setup Steps

### 1. Create R2 Bucket
1. Log in to your Cloudflare dashboard
2. Navigate to **R2 Object Storage**
3. Click **Create bucket**
4. Name your bucket: `duaab89-photos`
5. Click **Create bucket**

### 2. Generate API Tokens
1. In the R2 dashboard, click **Manage R2 API Tokens**
2. Click **Create API token**
3. Set permissions: **Object Read & Write**
4. Select the bucket: `duaab89-photos`
5. Click **Create API Token**
6. **IMPORTANT:** Copy and save:
   - Access Key ID
   - Secret Access Key
   (You won't be able to see the secret again!)

### 3. Configure Public Access (Optional)
1. Go to your bucket settings
2. Enable **Public Access** if you want photos to be publicly accessible
3. Note the public URL domain (e.g., `https://pub-xxx.r2.dev`)
4. Or set up a custom domain for better branding

### 4. Update Environment Variables

Add to your `.env.local` file:

```bash
# Cloudflare R2 Configuration
CLOUDFLARE_ACCOUNT_ID=your_account_id_from_dashboard
CLOUDFLARE_R2_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id_from_step2
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key_from_step2
CLOUDFLARE_R2_BUCKET_NAME=duaab89-photos
CLOUDFLARE_R2_PUBLIC_URL=https://your-public-url.r2.dev
```

### 5. Finding Your Account ID
1. In Cloudflare dashboard, go to **R2**
2. Your Account ID is visible in the sidebar or R2 overview page
3. Or check the URL: `https://dash.cloudflare.com/<ACCOUNT_ID>/r2`

## File Upload Structure

Photos are organized by user ID:
```
duaab89-photos/
├── user123/
│   ├── profile-1234567890.jpg
│   └── family-1234567891.jpg
├── user456/
│   ├── profile-1234567892.jpg
│   └── family-1234567893.jpg
```

## Usage in Application

### Profile Photo Upload
- Max size: 5MB
- Allowed formats: JPEG, PNG
- Stored at: `{userId}/profile-{timestamp}.{ext}`

### Family Photo Upload
- Max size: 5MB
- Allowed formats: JPEG, PNG
- Stored at: `{userId}/family-{timestamp}.{ext}`

## API Endpoints

### Upload Photo
```
POST /api/profile/upload-photo
Headers:
  - x-user-id: {userId}
  - Authorization: Bearer {token}
Body (FormData):
  - file: File
  - photoType: 'profile' | 'family'

Response:
{
  "success": true,
  "url": "https://...",
  "photoType": "profile",
  "message": "Photo uploaded successfully"
}
```

## Security Considerations

1. **Never commit credentials**: Ensure `.env.local` is in `.gitignore`
2. **Use HTTPS**: All R2 URLs use HTTPS
3. **Token Rotation**: Regularly rotate API tokens
4. **Bucket Permissions**: Set appropriate read/write permissions
5. **File Validation**: Server validates file type and size before upload

## Troubleshooting

### Upload fails with "Access Denied"
- Check API token permissions
- Verify token hasn't expired
- Ensure bucket name matches configuration

### Images not loading
- Check public access settings on bucket
- Verify CLOUDFLARE_R2_PUBLIC_URL is correct
- Check CORS settings if accessing from different domain

### Large file uploads timing out
- Default max size is 5MB
- Check network connection
- Consider increasing timeout in API route if needed

## Alternative: Firebase Storage

If you prefer to use Firebase Storage instead of R2:
1. Enable Firebase Storage in your project
2. Update upload endpoint to use Firebase Storage
3. Modify `upload-photo/route.ts` to use Firebase SDK

## Cost Considerations

Cloudflare R2 pricing (as of 2024):
- Storage: $0.015/GB/month
- Class A operations (writes): $4.50/million
- Class B operations (reads): $0.36/million
- No egress fees! ✨

For estimated 1000 users with 2 photos each (avg 500KB):
- Storage: ~1GB = $0.015/month
- Very cost-effective! 🎉
