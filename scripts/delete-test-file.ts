/**
 * Delete the test file from Firebase Storage
 * Run with: npm run delete-test
 */

// Load environment variables FIRST, before any imports
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { getFirebaseAdmin } from '../lib/firebase/admin';
import { getStorage } from 'firebase-admin/storage';

async function deleteTestFile() {
  console.log('🗑️  Deleting test file from Firebase Storage...\n');

  try {
    // Initialize Firebase Admin first
    const { db } = getFirebaseAdmin();
    console.log('✅ Firebase Admin initialized\n');

    // File details from the upload
    const fileName = 'photos/demo-user-001/profile-1763673590825.png';

    console.log(`📁 Deleting file: ${fileName}\n`);

    // Get Firebase Storage bucket
    const bucket = getStorage().bucket();
    const fileUpload = bucket.file(fileName);

    // Check if file exists
    const [exists] = await fileUpload.exists();
    
    if (!exists) {
      console.log('⚠️  File does not exist. It may have already been deleted.\n');
      return;
    }

    console.log('✅ File found in storage\n');

    // Delete the file
    await fileUpload.delete();
    console.log('✅ File deleted successfully!\n');

    // Also delete the Firestore profile record
    const profileRef = db.collection('profiles').doc('demo-user-001');
    await profileRef.delete();
    console.log('✅ Firestore profile record deleted\n');

    console.log('🎉 Cleanup complete!\n');

  } catch (error: any) {
    console.error('\n❌ Error deleting file:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

// Run the delete
deleteTestFile()
  .then(() => {
    console.log('✅ Deletion completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Deletion failed:', error);
    process.exit(1);
  });
