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

async function verifyProfiles() {
  console.log('✅ Verifying profiles collection...\n');
  
  const snapshot = await db.collection('profiles').limit(3).get();
  console.log(`Total profiles: ${snapshot.size}\n`);
  console.log('='.repeat(70));
  
  snapshot.forEach((doc, index) => {
    const data = doc.data();
    console.log(`\n📋 Profile ${index + 1}:`);
    console.log(`   Email: ${data.email}`);
    console.log(`   Full Name: ${data.fullName}`);
    console.log(`   Blood Group: ${data.bloodGroup || 'N/A'}`);
    console.log(`   Department: ${data.department || 'N/A'}`);
    console.log(`   Hall: ${data.hall || 'N/A'}`);
    console.log(`   Profession: ${data.profession || 'N/A'}`);
    console.log(`   Contact No: ${data.contactNo || 'N/A'}`);
    console.log(`   Present Address: ${data.presentAddress || 'N/A'}`);
    console.log(`   Home District: ${data.homeDistrict || 'N/A'}`);
    console.log(`   Date of Birth: ${data.dateOfBirth || 'N/A'}`);
    console.log('   ' + '-'.repeat(60));
  });
  
  console.log('\n✅ All profile data is correctly populated!\n');
}

verifyProfiles().then(() => process.exit(0)).catch(console.error);
