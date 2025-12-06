import * as dotenv from 'dotenv';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testMembersQuery() {
  try {
    console.log('Initializing Firebase Admin...');
    
    if (getApps().length === 0) {
      const firebaseAdminConfig = {
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      };
      
      initializeApp({
        credential: cert(firebaseAdminConfig),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    }

    const db = getFirestore();
    
    console.log('\n=== Testing Members Collection ===\n');
    
    // Test 1: Check if members collection exists
    console.log('1. Checking members collection...');
    const membersRef = db.collection('members');
    const allMembers = await membersRef.limit(5).get();
    console.log(`   Found ${allMembers.size} members (showing first 5)`);
    
    if (allMembers.size > 0) {
      console.log('\n   Sample member data:');
      let index = 0;
      allMembers.forEach((doc) => {
        const data = doc.data();
        index++;
        console.log(`   ${index}. ID: ${doc.id}`);
        console.log(`      Status: ${data.status || 'N/A'}`);
        console.log(`      Email: ${data.email || 'N/A'}`);
        console.log(`      Created: ${data.created_at || 'N/A'}`);
        console.log('');
      });
    }
    
    // Test 2: Query pending members
    console.log('\n2. Querying pending members...');
    try {
      const pendingMembers = await membersRef
        .where('status', '==', 'pending')
        .get();
      console.log(`   Found ${pendingMembers.size} pending members`);
    } catch (error: any) {
      console.error('   Error querying pending members:', error.message);
    }
    
    // Test 3: Query with orderBy
    console.log('\n3. Testing query with orderBy...');
    try {
      const orderedMembers = await membersRef
        .where('status', '==', 'pending')
        .orderBy('created_at', 'desc')
        .get();
      console.log(`   Successfully retrieved ${orderedMembers.size} members with orderBy`);
    } catch (error: any) {
      console.error('   Error with orderBy query:', error.message);
      console.log('   This usually means a composite index is needed in Firestore');
      
      if (error.message.includes('index')) {
        console.log('\n   To fix this, create a composite index in Firebase Console:');
        console.log('   Collection: members');
        console.log('   Fields: status (Ascending), created_at (Descending)');
      }
    }
    
    // Test 4: Check profiles collection
    console.log('\n4. Checking profiles collection...');
    const profilesRef = db.collection('profiles');
    const allProfiles = await profilesRef.limit(3).get();
    console.log(`   Found ${allProfiles.size} profiles (showing first 3)`);
    
    console.log('\n=== Test Complete ===\n');
    process.exit(0);
    
  } catch (error: any) {
    console.error('Fatal error:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testMembersQuery();
