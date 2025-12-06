import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

if (!getApps().length) {
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
  
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  });
}

const db = getFirestore();
const auth = getAuth();

async function checkAdmin() {
  try {
    console.log('\n=== CHECKING ADMIN STATUS ===\n');
    
    // Get all auth users
    const listUsers = await auth.listUsers();
    console.log('Firebase Auth Users:');
    listUsers.users.forEach(user => {
      console.log(`  - ${user.email} (UID: ${user.uid})`);
    });
    
    // Check user_roles collection
    console.log('\n=== USER ROLES ===');
    const rolesSnapshot = await db.collection('user_roles').get();
    if (rolesSnapshot.empty) {
      console.log('❌ NO USER ROLES FOUND! This is the problem.');
      console.log('You need to set admin role for your user.\n');
    } else {
      rolesSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`  UID: ${doc.id}`);
        console.log(`  Role: ${data.role}`);
        console.log(`  Email: ${data.email || 'N/A'}\n`);
      });
    }
    
    // Check users collection
    console.log('=== USERS COLLECTION ===');
    const usersSnapshot = await db.collection('users').get();
    if (usersSnapshot.empty) {
      console.log('No users in users collection');
    } else {
      usersSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`  UID: ${doc.id}, Role: ${data.role || 'none'}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAdmin();
