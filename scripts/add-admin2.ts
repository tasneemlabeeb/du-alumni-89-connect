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

async function addAdminAccount() {
  const email = 'admin2@duaab89.org';
  const password = 'Admin@123456'; // Default password - should be changed after first login
  const displayName = 'DUAAB Admin 2';
  
  try {
    console.log(`\nCreating admin account: ${email}`);
    console.log('='.repeat(50));
    
    // 1. Create user in Firebase Auth
    let userRecord;
    try {
      userRecord = await auth.createUser({
        email: email,
        password: password,
        displayName: displayName,
        emailVerified: true, // Pre-verify admin email
      });
      console.log(`✓ Created in Firebase Auth (UID: ${userRecord.uid})`);
    } catch (error: any) {
      if (error.code === 'auth/email-already-exists') {
        console.log(`! Email already exists in Auth, fetching existing user...`);
        userRecord = await auth.getUserByEmail(email);
        console.log(`✓ Found existing user (UID: ${userRecord.uid})`);
      } else {
        throw error;
      }
    }
    
    const userId = userRecord.uid;
    
    // 2. Create/update user document in users collection
    const userRef = db.collection('users').doc(userId);
    await userRef.set({
      email: email,
      displayName: displayName,
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      approved: true,
      approval_count: 2,
      profile_complete: true,
    }, { merge: true });
    console.log(`✓ Created/updated in users collection`);
    
    // 3. Create/update member document
    const memberRef = db.collection('members').doc(userId);
    await memberRef.set({
      email: email,
      fullName: displayName,
      role: 'admin',
      approved: true,
      approval_count: 2,
      profile_complete: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    console.log(`✓ Created/updated in members collection`);
    
    // 4. Create/update profile document
    const profileRef = db.collection('profiles').doc(userId);
    await profileRef.set({
      email: email,
      fullName: displayName,
      role: 'admin',
      approved: true,
      approval_count: 2,
      profile_complete: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    console.log(`✓ Created/updated in profiles collection`);
    
    // 5. Create/update user_roles document
    const rolesRef = db.collection('user_roles').doc(userId);
    await rolesRef.set({
      email: email,
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    console.log(`✓ Created/updated in user_roles collection`);
    
    console.log('\n' + '='.repeat(50));
    console.log(`✅ Successfully created admin account: ${email}`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`⚠️  Please change the password after first login!`);
    
  } catch (error) {
    console.error(`Error creating admin account:`, error);
  }
}

// Run the creation
addAdminAccount()
  .then(() => {
    console.log('\nAdmin creation complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
