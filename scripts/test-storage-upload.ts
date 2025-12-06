/**
 * Test script to verify Firebase Storage upload functionality
 * Run with: npm run test-storage
 */

// Load environment variables FIRST, before any imports
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { getFirebaseAdmin } from '../lib/firebase/admin';
import { getStorage } from 'firebase-admin/storage';
import * as fs from 'fs';
import * as path from 'path';

async function testStorageUpload() {
  console.log('🔥 Testing Firebase Storage Upload...\n');
  
  // Debug: Check env variables
  console.log('📋 Environment Variables Check:');
  console.log('   Project ID:', process.env.FIREBASE_ADMIN_PROJECT_ID);
  console.log('   Client Email:', process.env.FIREBASE_ADMIN_CLIENT_EMAIL);
  console.log('   Private Key exists:', !!process.env.FIREBASE_ADMIN_PRIVATE_KEY);
  console.log('   Storage Bucket:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
  console.log('');

  try {
    // Initialize Firebase Admin first
    const { db } = getFirebaseAdmin();
    console.log('✅ Firebase Admin initialized');
    
    // Create a test image buffer (1x1 red pixel PNG)
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
      'base64'
    );

    const testUserId = 'test-user-123';
    const photoType = 'profile';
    const timestamp = Date.now();
    const fileName = `photos/${testUserId}/${photoType}-${timestamp}.png`;

    console.log(`📁 Uploading file: ${fileName}`);

    // Get Firebase Storage bucket
    const bucket = getStorage().bucket();
    console.log(`✅ Connected to bucket: ${bucket.name}`);

    // Upload the test file
    const fileUpload = bucket.file(fileName);
    
    await fileUpload.save(testImageBuffer, {
      metadata: {
        contentType: 'image/png',
        metadata: {
          userId: testUserId,
          photoType: photoType,
          originalName: 'test-image.png',
          uploadedAt: new Date().toISOString(),
        },
      },
    });

    console.log('✅ File uploaded successfully!');

    // Make file publicly accessible
    await fileUpload.makePublic();
    console.log('✅ File made public');

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    console.log(`\n🌐 Public URL: ${publicUrl}`);

    // Verify file exists
    const [exists] = await fileUpload.exists();
    console.log(`✅ File exists in storage: ${exists}`);

    // Get file metadata
    const [metadata] = await fileUpload.getMetadata();
    console.log(`\n📋 File metadata:`);
    console.log(`   - Size: ${metadata.size} bytes`);
    console.log(`   - Content Type: ${metadata.contentType}`);
    console.log(`   - Created: ${metadata.timeCreated}`);
    console.log(`   - Public: ${metadata.metadata?.firebaseStorageDownloadTokens ? 'Yes' : 'No (but made public)'}`);

    // Test updating Firestore with the URL
    const profileRef = db.collection('profiles').doc(testUserId);
    
    await profileRef.set({
      profilePhotoUrl: publicUrl,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    console.log('✅ Profile updated in Firestore');

    // Read it back
    const profileDoc = await profileRef.get();
    const profileData = profileDoc.data();
    console.log(`\n✅ Firestore verification:`);
    console.log(`   - Profile photo URL: ${profileData?.profilePhotoUrl}`);

    console.log('\n🎉 All tests passed! Firebase Storage is working correctly.\n');
    console.log('📝 Summary:');
    console.log('   ✅ File uploaded to Firebase Storage');
    console.log('   ✅ File made publicly accessible');
    console.log('   ✅ Public URL generated');
    console.log('   ✅ Firestore updated with URL');
    console.log('   ✅ Data verified in Firestore\n');

    // Clean up test file
    console.log('🧹 Cleaning up test file...');
    await fileUpload.delete();
    console.log('✅ Test file deleted');
    
    // Clean up test profile
    await profileRef.delete();
    console.log('✅ Test profile deleted\n');

  } catch (error: any) {
    console.error('\n❌ Error during storage test:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

// Run the test
testStorageUpload()
  .then(() => {
    console.log('✅ Test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
