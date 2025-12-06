import { adminStorage } from '../firebase/admin';

// Using Firebase Storage instead of Cloudflare R2
// Firebase Storage is already configured and has 5GB free tier
const BUCKET_NAME = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!;

export async function uploadToR2(
  file: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  const bucket = adminStorage.bucket(BUCKET_NAME);
  const fileRef = bucket.file(key);

  await fileRef.save(file, {
    metadata: {
      contentType,
    },
  });

  // Make the file publicly accessible
  await fileRef.makePublic();

  // Return the public URL
  return `https://storage.googleapis.com/${BUCKET_NAME}/${key}`;
}

export async function deleteFromR2(key: string): Promise<void> {
  const bucket = adminStorage.bucket(BUCKET_NAME);
  const fileRef = bucket.file(key);
  
  await fileRef.delete();
}

export async function getSignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
  const bucket = adminStorage.bucket(BUCKET_NAME);
  const fileRef = bucket.file(key);
  
  const [url] = await fileRef.getSignedUrl({
    action: 'read',
    expires: Date.now() + expiresIn * 1000,
  });
  
  return url;
}
