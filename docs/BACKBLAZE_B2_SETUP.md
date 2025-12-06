# Backblaze B2 Storage Setup Guide

## Overview
Backblaze B2 is an S3-compatible object storage service that's cost-effective and easy to set up. This guide will help you configure B2 for storing profile and family photos.

## Why Backblaze B2?

✅ **Advantages:**
- **Cost-effective**: $0.005/GB/month (1/4 the cost of S3)
- **First 10GB free** every month
- **Free egress**: First 1GB/day free, then 3x your storage
- **S3-compatible**: Works with existing S3 SDKs
- **Simple pricing**: No hidden fees
- **Reliable**: 99.9% uptime SLA

## Setup Steps

### 1. Create Backblaze Account

1. Go to [https://www.backblaze.com/b2/](https://www.backblaze.com/b2/)
2. Click **Sign Up** (Free account available)
3. Verify your email
4. Complete account setup

### 2. Create a Bucket

1. Log in to your Backblaze account
2. Navigate to **B2 Cloud Storage** → **Buckets**
3. Click **Create a Bucket**
4. Configure:
   - **Bucket Name**: `duaab89-photos` (must be globally unique)
   - **Files in Bucket**: **Public** (for public photo access)
   - **Encryption**: Default (Server-side encryption)
   - **Object Lock**: Disabled
5. Click **Create a Bucket**

### 3. Generate Application Key

1. Go to **App Keys** in the left sidebar
2. Click **Add a New Application Key**
3. Configure:
   - **Name**: `duaab89-portal-upload`
   - **Allow access to**: Select your bucket (`duaab89-photos`)
   - **Type of Access**: **Read and Write**
   - **Allow List All Bucket Names**: Check this
4. Click **Create New Key**
5. **IMPORTANT**: Copy and save immediately:
   - `keyID` (Access Key ID)
   - `applicationKey` (Secret Access Key)
   - You won't see the applicationKey again!

### 4. Get Bucket Information

After creating the bucket, note these details:

1. **Endpoint URL**: 
   - Format: `https://s3.{region}.backblazeb2.com`
   - Example: `https://s3.us-west-004.backblazeb2.com`
   - Find this in bucket details

2. **Region**: 
   - Example: `us-west-004`
   - Shown in bucket settings

3. **Public URL**:
   - Format: `https://f{region-number}.backblazeb2.com/file/{bucket-name}`
   - Example: `https://f004.backblazeb2.com/file/duaab89-photos`

### 5. Update Environment Variables

Add to your `.env.local` file:

```bash
# Backblaze B2 Configuration
STORAGE_ENDPOINT=https://s3.us-west-004.backblazeb2.com
STORAGE_REGION=us-west-004
STORAGE_ACCESS_KEY_ID=004abc123def456789
STORAGE_SECRET_ACCESS_KEY=K004abcdefghijklmnopqrstuvwxyz123456
STORAGE_BUCKET_NAME=duaab89-photos
STORAGE_PUBLIC_URL=https://f004.backblazeb2.com/file/duaab89-photos
```

**Replace:**
- `us-west-004` with your actual region
- `004abc123def456789` with your keyID
- `K004abcdef...` with your applicationKey
- `duaab89-photos` with your bucket name

### 6. Configure Bucket CORS (Optional but Recommended)

If you want to upload directly from browser:

1. Go to your bucket settings
2. Under **Bucket Settings** → **CORS Rules**
3. Add rule:

```json
[
  {
    "corsRuleName": "allowUploads",
    "allowedOrigins": [
      "https://your-domain.com",
      "http://localhost:3000"
    ],
    "allowedOperations": [
      "s3_put",
      "s3_get"
    ],
    "allowedHeaders": [
      "*"
    ],
    "maxAgeSeconds": 3600
  }
]
```

## File Structure

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

The application automatically uses the configured storage provider. No code changes needed!

### Upload Limits
- Max file size: 5MB
- Allowed formats: JPEG, PNG
- Validation happens on server-side

### Photo Types
1. **Profile Photo**: `{userId}/profile-{timestamp}.{ext}`
2. **Family Photo**: `{userId}/family-{timestamp}.{ext}`

## Pricing Examples

### For 1000 users with 2 photos each (500KB avg)

**Storage:**
- Total: 1GB
- Cost: $0.005/GB = **$0.005/month**
- (First 10GB free, so actually **$0!**)

**Downloads:**
- Assume 100 views/day
- Total: ~50MB/day
- First 1GB/day free
- Cost: **$0/month**

**Uploads:**
- Class B operations: Free
- Cost: **$0/month**

**Total: FREE** for typical usage! 🎉

### For 10,000 users

**Storage:**
- Total: 10GB
- Cost: **$0/month** (within free tier!)

**Downloads:**
- 5GB/day = 150GB/month
- Free allowance: 30GB (1GB × 30 days)
- Paid: 120GB × $0.01/GB = **$1.20/month**

**Total: ~$1.20/month** - Still very cheap!

## Comparison: Backblaze B2 vs Cloudflare R2

| Feature | Backblaze B2 | Cloudflare R2 |
|---------|--------------|---------------|
| Storage | $0.005/GB/mo | $0.015/GB/mo |
| Egress | $0.01/GB (after 3× storage) | **FREE** |
| Free Tier | 10GB storage | None |
| Setup | Easy | Easy |
| Best For | Small to medium | High traffic |

**Recommendation:**
- Use **Backblaze B2** for this project (better free tier, lower costs)
- Consider R2 only if you have very high download traffic

## Security Best Practices

1. ✅ **Never commit credentials** - Already in `.gitignore`
2. ✅ **Use application keys** - Not master keys
3. ✅ **Restrict permissions** - Only read/write for specific bucket
4. ✅ **Enable encryption** - Server-side encryption enabled
5. ✅ **Rotate keys** - Change application keys every 90 days
6. ✅ **Monitor usage** - Check B2 dashboard regularly

## Troubleshooting

### "Access Denied" Error
- Verify application key has correct permissions
- Check bucket name matches exactly
- Ensure key is for the correct bucket

### Photos Not Loading
- Check bucket is set to **Public**
- Verify `STORAGE_PUBLIC_URL` is correct
- Test URL directly in browser

### Upload Timeout
- Check network connection
- Ensure file is under 5MB
- Try smaller test file first

### Wrong Region
- Get region from bucket details page
- Format: `us-west-XXX` or `eu-central-XXX`
- Endpoint must match region

## Testing Your Setup

1. **Test Upload** (after configuration):
   - Log in to the portal
   - Go to Profile page
   - Try uploading a small image
   - Check if it appears in B2 bucket

2. **Verify in B2 Dashboard**:
   - Go to Buckets → duaab89-photos
   - Click **Browse Files**
   - You should see: `{userId}/profile-{timestamp}.jpg`

3. **Test Public Access**:
   - Copy the public URL from Firestore
   - Open in browser
   - Image should load

## Migration from Cloudflare R2

If you're switching from R2 to B2:

1. Update `.env.local` with B2 credentials
2. Restart your dev server
3. No code changes needed!
4. Old R2 photos will still work
5. New uploads go to B2
6. (Optional) Migrate old photos using B2 CLI

## Additional Resources

- [B2 Documentation](https://www.backblaze.com/b2/docs/)
- [S3 Compatible API](https://www.backblaze.com/b2/docs/s3_compatible_api.html)
- [Pricing Calculator](https://www.backblaze.com/b2/cloud-storage-pricing.html)
- [B2 CLI Tool](https://www.backblaze.com/b2/docs/quick_command_line.html)

## Support

If you encounter issues:
1. Check B2 dashboard for errors
2. Review application key permissions
3. Verify environment variables
4. Check bucket public access settings
5. Contact Backblaze support (excellent support!)

---

**Estimated monthly cost for this project: $0 - $2** 💰✨
