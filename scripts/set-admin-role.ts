import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { adminAuth, adminDb } from '../lib/firebase/admin';

async function setAdminRole() {
  try {
    const email = process.argv[2];
    
    if (!email) {
      console.error('Usage: npx tsx scripts/set-admin-role.ts <user-email>');
      process.exit(1);
    }

    console.log(`Looking for user with email: ${email}`);
    
    // Get user by email from Firebase Auth
    const userRecord = await adminAuth.getUserByEmail(email);
    console.log(`Found user: ${userRecord.uid}`);
    
    // Update user document in Firestore
    await adminDb.collection('users').doc(userRecord.uid).set({
      role: 'admin',
      updated_at: new Date().toISOString(),
    }, { merge: true });
    
    console.log(`✅ Successfully set admin role for ${email}`);
    console.log(`User ID: ${userRecord.uid}`);
    
    // Verify the update
    const userDoc = await adminDb.collection('users').doc(userRecord.uid).get();
    const userData = userDoc.data();
    console.log(`\nVerified role: ${userData?.role}`);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

setAdminRole();
