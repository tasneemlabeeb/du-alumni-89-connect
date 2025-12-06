/**
 * Script to create a test user in Firebase
 * This creates both an auth user and the required Firestore documents
 */

import * as dotenv from 'dotenv';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin
if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')!,
    }),
  });
}

const auth = getAuth();
const db = getFirestore();

async function createTestUser() {
  try {
    console.log('🚀 Creating test admin user...\n');

    // User details
    const testUser = {
      email: 'admin@duaab89.com',
      password: 'Admin@123456',
      displayName: 'Test Admin',
      fullName: 'Test Admin User',
    };

    // Create user in Firebase Auth
    console.log('📝 Creating auth user...');
    const userRecord = await auth.createUser({
      email: testUser.email,
      password: testUser.password,
      displayName: testUser.displayName,
      emailVerified: true,
    });

    console.log(`✅ Auth user created with UID: ${userRecord.uid}`);

    // Create member document in Firestore
    console.log('\n📝 Creating member document...');
    await db.collection('members').doc(userRecord.uid).set({
      user_id: userRecord.uid,
      full_name: testUser.fullName,
      email: testUser.email,
      status: 'approved',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Optional fields you might want to add
      batch: '1989',
      department: 'Not specified',
      current_location: 'Not specified',
      current_organization: 'Not specified',
    });

    console.log('✅ Member document created');

    // Create admin role
    console.log('\n📝 Creating admin role...');
    await db.collection('user_roles').add({
      user_id: userRecord.uid,
      role: 'admin',
      created_at: new Date().toISOString(),
    });

    console.log('✅ Admin role assigned');

    console.log('\n🎉 Test user created successfully!');
    console.log('\n📧 Login credentials:');
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Password: ${testUser.password}`);
    console.log(`\n👤 User ID: ${userRecord.uid}`);
    console.log('\n✨ This user has admin privileges and approved member status.');

  } catch (error: any) {
    console.error('❌ Error creating test user:', error.message);
    
    if (error.code === 'auth/email-already-exists') {
      console.log('\n💡 User already exists. You can use these credentials:');
      console.log('   Email: admin@duaab89.com');
      console.log('   Password: Admin@123456');
    }
  }
}

// Run the script
createTestUser()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
