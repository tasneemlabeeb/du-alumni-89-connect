/**
 * Upload a test file to Firebase Storage (permanent - not deleted)
 * Run with: npm run upload-test
 */

// Load environment variables FIRST, before any imports
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { getFirebaseAdmin } from '../lib/firebase/admin';
import { getStorage } from 'firebase-admin/storage';

async function uploadTestFile() {
  console.log('🔥 Uploading test file to Firebase Storage...\n');

  try {
    // Initialize Firebase Admin first
    const { db } = getFirebaseAdmin();
    console.log('✅ Firebase Admin initialized\n');

    // Create a test image buffer (1x1 red pixel PNG)
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
      'base64'
    );

    const testUserId = 'demo-user-001';
    const photoType = 'profile';
    const timestamp = Date.now();
    const fileName = `photos/${testUserId}/${photoType}-${timestamp}.png`;

    console.log(`📁 Uploading file: ${fileName}\n`);

    // Get Firebase Storage bucket
    const bucket = getStorage().bucket();
    console.log(`✅ Connected to bucket: ${bucket.name}\n`);

    // Upload the test file
    const fileUpload = bucket.file(fileName);
    
    await fileUpload.save(testImageBuffer, {
      metadata: {
        contentType: 'image/png',
        metadata: {
          userId: testUserId,
          photoType: photoType,
          originalName: 'test-demo-photo.png',
          uploadedAt: new Date().toISOString(),
          description: 'Demo test file - permanent',
        },
      },
    });

    console.log('✅ File uploaded successfully!\n');

    // Make file publicly accessible
    await fileUpload.makePublic();
    console.log('✅ File made public\n');

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🌐 PUBLIC URL:');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(publicUrl);
    console.log('═══════════════════════════════════════════════════════════════\n');

    // Verify file exists
    const [exists] = await fileUpload.exists();
    console.log(`✅ File exists in storage: ${exists}\n`);

    // Get file metadata
    const [metadata] = await fileUpload.getMetadata();
    console.log(`📋 File metadata:`);
    console.log(`   - Size: ${metadata.size} bytes`);
    console.log(`   - Content Type: ${metadata.contentType}`);
    console.log(`   - Created: ${metadata.timeCreated}`);
    console.log(`   - Storage Location: ${metadata.bucket}/${metadata.name}\n`);

    // Update Firestore with the URL
    const profileRef = db.collection('profiles').doc(testUserId);
    
    await profileRef.set({
      profilePhotoUrl: publicUrl,
      updatedAt: new Date().toISOString(),
      userId: testUserId,
      displayName: 'Demo User',
    }, { merge: true });

    console.log('✅ Profile updated in Firestore\n');

    console.log('🎉 Upload complete! File is stored permanently.\n');
    console.log('📝 To delete this file later, run:');
    console.log(`   gsutil rm gs://${bucket.name}/${fileName}`);
    console.log(`   Or delete from Firebase Console: https://console.firebase.google.com/project/duaab89-67c12/storage\n`);

  } catch (error: any) {
    console.error('\n❌ Error uploading file:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

// Run the upload
uploadTestFile()
  .then(() => {
    console.log('✅ Upload completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Upload failed:', error);
    process.exit(1);
  });
