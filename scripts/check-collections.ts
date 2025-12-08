import * as dotenv from 'dotenv';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

dotenv.config({ path: '.env.local' });

if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')!,
    }),
  });
}

const db = getFirestore();

async function checkCollections() {
  console.log('🔍 Checking Firestore Collections...\n');
  
  // Check members collection
  const membersSnapshot = await db.collection('members').limit(1).get();
  console.log('📋 Members collection:');
  console.log(`   Count: ${membersSnapshot.size}`);
  if (!membersSnapshot.empty) {
    console.log('   Sample:', JSON.stringify(membersSnapshot.docs[0].data(), null, 2));
  }
  
  console.log('\n' + '='.repeat(70) + '\n');
  
  // Check profiles collection
  const profilesSnapshot = await db.collection('profiles').limit(1).get();
  console.log('👤 Profiles collection:');
  console.log(`   Count: ${profilesSnapshot.size}`);
  if (!profilesSnapshot.empty) {
    console.log('   Sample:', JSON.stringify(profilesSnapshot.docs[0].data(), null, 2));
  } else {
    console.log('   ⚠️  No profiles found!');
  }
}

checkCollections()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
