import * as admin from 'firebase-admin';
import { config } from 'dotenv';

// Load environment variables
config();

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

const db = admin.firestore();
const auth = admin.auth();

async function deleteAdminAccount() {
  const email = 'admin@duaab89.com';
  
  try {
    console.log(`\nDeleting admin account: ${email}`);
    console.log('='.repeat(50));
    
    // 1. Find user by email in users collection
    const usersSnapshot = await db.collection('users').where('email', '==', email).get();
    let userId: string | null = null;
    
    if (!usersSnapshot.empty) {
      const userDoc = usersSnapshot.docs[0];
      userId = userDoc.id;
      await userDoc.ref.delete();
      console.log(`✓ Deleted from users collection (ID: ${userId})`);
    } else {
      console.log(`✗ Not found in users collection`);
    }
    
    // 2. Delete from members collection
    const membersSnapshot = await db.collection('members').where('email', '==', email).get();
    if (!membersSnapshot.empty) {
      await membersSnapshot.docs[0].ref.delete();
      console.log(`✓ Deleted from members collection`);
    } else {
      console.log(`✗ Not found in members collection`);
    }
    
    // 3. Delete from profiles collection (if userId exists)
    if (userId) {
      const profileRef = db.collection('profiles').doc(userId);
      const profileDoc = await profileRef.get();
      if (profileDoc.exists) {
        await profileRef.delete();
        console.log(`✓ Deleted from profiles collection`);
      } else {
        console.log(`✗ Not found in profiles collection`);
      }
    }
    
    // 4. Delete from user_roles collection
    const rolesSnapshot = await db.collection('user_roles').where('email', '==', email).get();
    if (!rolesSnapshot.empty) {
      await rolesSnapshot.docs[0].ref.delete();
      console.log(`✓ Deleted from user_roles collection`);
    } else {
      console.log(`✗ Not found in user_roles collection`);
    }
    
    // 5. Delete from Firebase Auth
    try {
      const userRecord = await auth.getUserByEmail(email);
      await auth.deleteUser(userRecord.uid);
      console.log(`✓ Deleted from Firebase Auth (UID: ${userRecord.uid})`);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        console.log(`✗ Not found in Firebase Auth`);
      } else {
        console.log(`✗ Error deleting from Firebase Auth: ${error.message}`);
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`✅ Completed deletion process for ${email}`);
    
  } catch (error) {
    console.error(`Error deleting ${email}:`, error);
  }
}

// Run the deletion
deleteAdminAccount()
  .then(() => {
    console.log('\nDeletion complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
