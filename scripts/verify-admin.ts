import * as dotenv from 'dotenv';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  initializeApp({
    credential: cert(serviceAccount as any),
  });
}

const auth = getAuth();
const db = getFirestore();

async function verifyAndFixAdmin() {
  try {
    console.log('🔍 Checking current user authentication...\n');

    // List all users
    const listUsersResult = await auth.listUsers();
    console.log(`Found ${listUsersResult.users.length} users in Firebase Auth:\n`);

    for (const userRecord of listUsersResult.users) {
      console.log(`👤 User: ${userRecord.email}`);
      console.log(`   UID: ${userRecord.uid}`);

      // Check if user has document in 'users' collection
      const userDoc = await db.collection('users').doc(userRecord.uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        console.log(`   ✅ Has users doc with role: ${userData?.role || 'NONE'}`);
      } else {
        console.log(`   ❌ NO users document - Creating with admin role...`);
        await db.collection('users').doc(userRecord.uid).set({
          email: userRecord.email,
          role: 'admin',
          created_at: new Date().toISOString(),
        });
        console.log(`   ✅ Created users document with admin role`);
      }

      // Check user_roles collection too
      const userRoleDoc = await db.collection('user_roles').doc(userRecord.uid).get();
      if (userRoleDoc.exists) {
        const roleData = userRoleDoc.data();
        console.log(`   ✅ Has user_roles doc with role: ${roleData?.role || 'NONE'}`);
      } else {
        console.log(`   ⚠️  NO user_roles document`);
      }

      console.log('');
    }

    console.log('\n✅ All users verified and fixed!\n');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

verifyAndFixAdmin();
