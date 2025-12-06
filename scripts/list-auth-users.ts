import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { adminAuth, adminDb } from '../lib/firebase/admin';

async function listAuthUsers() {
  try {
    console.log('🔍 Checking Firebase Authentication Users...\n');
    
    // List all users from Firebase Auth
    const listUsersResult = await adminAuth.listUsers(1000);
    
    console.log(`📊 Total users in Firebase Auth: ${listUsersResult.users.length}\n`);
    
    if (listUsersResult.users.length === 0) {
      console.log('⚠️  No users found in Firebase Authentication!');
      console.log('Please sign up at: http://localhost:3000/auth\n');
      return;
    }
    
    console.log('👥 Firebase Auth Users:\n');
    console.log('─'.repeat(80));
    
    for (const user of listUsersResult.users) {
      console.log(`\nUser ID: ${user.uid}`);
      console.log(`Email: ${user.email || 'N/A'}`);
      console.log(`Display Name: ${user.displayName || 'N/A'}`);
      console.log(`Email Verified: ${user.emailVerified}`);
      console.log(`Created: ${user.metadata.creationTime}`);
      
      // Check if this user exists in Firestore
      const userDoc = await adminDb.collection('users').doc(user.uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        console.log(`Firestore Role: ${userData?.role || 'user'}`);
        console.log(`Approval Status: ${userData?.approval_status || 'N/A'}`);
      } else {
        console.log(`⚠️  NOT IN FIRESTORE - User document missing!`);
      }
    }
    
    console.log('\n' + '─'.repeat(80));
    
    // Check for sync issues
    const firestoreUsers = await adminDb.collection('users').get();
    if (listUsersResult.users.length !== firestoreUsers.size) {
      console.log(`\n⚠️  SYNC ISSUE DETECTED!`);
      console.log(`Firebase Auth: ${listUsersResult.users.length} users`);
      console.log(`Firestore: ${firestoreUsers.size} users`);
      console.log(`\nSome users exist in Auth but not in Firestore.`);
      console.log(`This can happen if signup didn't complete properly.\n`);
    }
    
    console.log('\nTo make a user admin, run:');
    console.log('npx tsx scripts/set-admin-role.ts <email>\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
    if (error instanceof Error) {
      console.error('Details:', error.message);
    }
  }
}

listAuthUsers().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
