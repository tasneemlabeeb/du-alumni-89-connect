import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { adminAuth, adminDb } from '../lib/firebase/admin';

async function syncUsersToFirestore() {
  try {
    console.log('🔄 Syncing Firebase Auth users to Firestore...\n');
    
    const listUsersResult = await adminAuth.listUsers(1000);
    
    if (listUsersResult.users.length === 0) {
      console.log('No users to sync.');
      return;
    }
    
    for (const user of listUsersResult.users) {
      console.log(`Processing: ${user.email}`);
      
      // Check if user document exists
      const userDoc = await adminDb.collection('users').doc(user.uid).get();
      
      if (!userDoc.exists) {
        // Create user document
        await adminDb.collection('users').doc(user.uid).set({
          email: user.email,
          full_name: user.displayName || '',
          role: user.email === 'admin@duaab89.com' ? 'admin' : 'user',
          approval_status: 'approved', // Auto-approve existing users
          email_verified: user.emailVerified,
          created_at: user.metadata.creationTime,
          updated_at: new Date().toISOString(),
        });
        
        console.log(`  ✅ Created Firestore document`);
        if (user.email === 'admin@duaab89.com') {
          console.log(`  👑 Set as ADMIN`);
        }
      } else {
        console.log(`  ℹ️  Already exists in Firestore`);
      }
    }
    
    console.log('\n✅ Sync complete!\n');
    
    // Verify
    const firestoreSnapshot = await adminDb.collection('users').get();
    console.log(`Total users in Firestore now: ${firestoreSnapshot.size}`);
    
    // Show admin users
    const adminSnapshot = await adminDb.collection('users').where('role', '==', 'admin').get();
    console.log(`Admin users: ${adminSnapshot.size}\n`);
    
    adminSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`👑 Admin: ${data.email}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    if (error instanceof Error) {
      console.error('Details:', error.message);
    }
  }
}

syncUsersToFirestore().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
