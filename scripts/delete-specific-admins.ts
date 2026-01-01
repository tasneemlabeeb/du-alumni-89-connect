import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env') });

import { adminAuth, adminDb } from '../lib/firebase/admin';

const ACCOUNTS_TO_DELETE = [
  'labeebzaman0.9@gmail.com',
  'tasneemlabeeb@gmail.com'
];

async function deleteAdminAccounts() {
  console.log('🗑️  Starting deletion process...\n');

  for (const email of ACCOUNTS_TO_DELETE) {
    console.log(`\nProcessing: ${email}`);
    console.log('─'.repeat(70));

    try {
      // Get user from Firebase Auth by email
      let userRecord;
      try {
        userRecord = await adminAuth.getUserByEmail(email);
        console.log('✓ Found user in Firebase Auth:', userRecord.uid);
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          console.log('⚠️  User not found in Firebase Auth');
          userRecord = null;
        } else {
          throw error;
        }
      }

      if (userRecord) {
        const userId = userRecord.uid;

        // 1. Delete from 'users' collection
        try {
          const userDoc = await adminDb.collection('users').doc(userId).get();
          if (userDoc.exists) {
            await adminDb.collection('users').doc(userId).delete();
            console.log('✓ Deleted from users collection');
          } else {
            console.log('⚠️  No document in users collection');
          }
        } catch (error) {
          console.log('⚠️  Error deleting from users collection:', error);
        }

        // 2. Delete from 'members' collection
        try {
          const memberDoc = await adminDb.collection('members').doc(userId).get();
          if (memberDoc.exists) {
            await adminDb.collection('members').doc(userId).delete();
            console.log('✓ Deleted from members collection');
          } else {
            console.log('⚠️  No document in members collection');
          }
        } catch (error) {
          console.log('⚠️  Error deleting from members collection:', error);
        }

        // 3. Delete from 'profiles' collection
        try {
          const profileDoc = await adminDb.collection('profiles').doc(userId).get();
          if (profileDoc.exists) {
            await adminDb.collection('profiles').doc(userId).delete();
            console.log('✓ Deleted from profiles collection');
          } else {
            console.log('⚠️  No document in profiles collection');
          }
        } catch (error) {
          console.log('⚠️  Error deleting from profiles collection:', error);
        }

        // 4. Delete from 'user_roles' collection
        try {
          const rolesSnapshot = await adminDb
            .collection('user_roles')
            .where('user_id', '==', userId)
            .get();
          
          if (!rolesSnapshot.empty) {
            const batch = adminDb.batch();
            rolesSnapshot.forEach(doc => {
              batch.delete(doc.ref);
            });
            await batch.commit();
            console.log(`✓ Deleted ${rolesSnapshot.size} role(s) from user_roles collection`);
          } else {
            console.log('⚠️  No roles found in user_roles collection');
          }
        } catch (error) {
          console.log('⚠️  Error deleting from user_roles collection:', error);
        }

        // 5. Delete from Firebase Auth (do this last)
        try {
          await adminAuth.deleteUser(userId);
          console.log('✓ Deleted from Firebase Auth');
        } catch (error) {
          console.log('⚠️  Error deleting from Firebase Auth:', error);
        }

        console.log(`\n✅ Successfully deleted all data for ${email}`);
      } else {
        console.log(`\n⚠️  Account ${email} not found, skipping...`);
      }

    } catch (error: any) {
      console.error(`\n❌ Error processing ${email}:`, error.message);
    }
  }

  console.log('\n' + '═'.repeat(70));
  console.log('\n✅ Deletion process completed!\n');
}

deleteAdminAccounts()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
