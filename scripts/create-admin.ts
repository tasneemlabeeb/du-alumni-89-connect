import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { adminAuth, adminDb } from '../lib/firebase/admin';

async function createAdminUser() {
  const email = 'admin@duaab89.org';
  const password = 'DUaab89admin@';
  const displayName = 'DUAAB Admin';

  try {
    console.log('Creating admin user...');
    
    // Check if user already exists
    let userRecord;
    try {
      userRecord = await adminAuth.getUserByEmail(email);
      console.log('User already exists in Firebase Auth:', userRecord.uid);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // Create new user in Firebase Auth
        userRecord = await adminAuth.createUser({
          email: email,
          password: password,
          displayName: displayName,
          emailVerified: true,
        });
        console.log('✅ User created in Firebase Auth:', userRecord.uid);
      } else {
        throw error;
      }
    }

    // Create or update user document in Firestore
    const userRef = adminDb.collection('users').doc(userRecord.uid);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      // Update existing user to admin
      await userRef.update({
        role: 'admin',
        approval_status: 'approved',
        updated_at: new Date().toISOString(),
      });
      console.log('✅ Updated existing user to admin role');
    } else {
      // Create new user document
      await userRef.set({
        email: email,
        full_name: displayName,
        role: 'admin',
        approval_status: 'approved',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      console.log('✅ Created user document in Firestore');
    }

    // Set custom claims
    await adminAuth.setCustomUserClaims(userRecord.uid, { admin: true });
    console.log('✅ Set admin custom claims');

    console.log('\n✨ Admin user created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('UID:', userRecord.uid);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
}

createAdminUser()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
