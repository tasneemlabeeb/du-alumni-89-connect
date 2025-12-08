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

async function checkFirestoreData() {
  console.log('🔍 Checking Firestore Database...\n');
  console.log('Project ID:', process.env.FIREBASE_ADMIN_PROJECT_ID);
  console.log('='.repeat(70));
  
  // Count total members
  const snapshot = await db.collection('members').get();
  console.log(`\n📊 Total members in Firestore: ${snapshot.size}\n`);
  
  if (snapshot.size === 0) {
    console.log('❌ No members found in Firestore!');
    console.log('\nPossible issues:');
    console.log('1. Wrong Firebase project connected');
    console.log('2. Data was written to different collection');
    console.log('3. Firebase credentials issue\n');
    return;
  }
  
  // Show 3 sample members with ALL fields
  console.log('📋 Sample Members (first 3):\n');
  
  let count = 0;
  snapshot.forEach((doc) => {
    if (count < 3) {
      const data = doc.data();
      console.log(`\n${count + 1}. Document ID: ${doc.id}`);
      console.log('   Data:', JSON.stringify(data, null, 2));
      console.log('   ' + '-'.repeat(60));
      count++;
    }
  });
  
  // Check for a specific email
  console.log('\n🔎 Searching for a specific member...');
  const memberQuery = await db.collection('members')
    .where('email', '==', 'rashid.mamun2008@gmail.com')
    .get();
  
  if (memberQuery.empty) {
    console.log('❌ Could not find rashid.mamun2008@gmail.com');
  } else {
    console.log('✅ Found member:');
    memberQuery.forEach(doc => {
      console.log(JSON.stringify(doc.data(), null, 2));
    });
  }
}

checkFirestoreData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  });
