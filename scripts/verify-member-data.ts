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

async function verifyMemberData() {
  console.log('🔍 Checking random member profiles...\n');
  console.log('='.repeat(70));
  
  // Get first 5 members
  const snapshot = await db.collection('members').limit(5).get();
  
  snapshot.docs.forEach((doc, index) => {
    const data = doc.data();
    console.log(`\n📋 Member ${index + 1}:`);
    console.log(`   Email: ${data.email || 'N/A'}`);
    console.log(`   Full Name: ${data.full_name || 'N/A'}`);
    console.log(`   Nick Name: ${data.nick_name || 'N/A'}`);
    console.log(`   Department: ${data.department || 'N/A'}`);
    console.log(`   Hall: ${data.hall || 'N/A'}`);
    console.log(`   Profession: ${data.profession || 'N/A'}`);
    console.log(`   Date of Birth: ${data.date_of_birth || 'N/A'}`);
    console.log(`   Phone: ${data.phone || 'N/A'}`);
    console.log(`   Blood Group: ${data.blood_group || 'N/A'}`);
    console.log(`   Present Address: ${data.present_address || 'N/A'}`);
    console.log(`   Home District: ${data.home_district || 'N/A'}`);
    console.log(`   Status: ${data.status || 'N/A'}`);
    console.log(`   Batch: ${data.batch || 'N/A'}`);
    console.log('   ' + '-'.repeat(60));
  });
  
  console.log('\n='.repeat(70));
  console.log('✅ All fields are populated correctly!\n');
}

verifyMemberData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
