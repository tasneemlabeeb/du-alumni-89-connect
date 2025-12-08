/**
 * Update presentCityOfLiving field in profiles
 * Since this data wasn't in the Excel, we'll copy it from homeDistrict
 */

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

async function updatePresentCity() {
  try {
    console.log('🚀 Updating presentCityOfLiving field...\n');
    
    const snapshot = await db.collection('profiles').get();
    console.log(`📊 Found ${snapshot.size} profiles\n`);
    
    let updated = 0;
    let skipped = 0;
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // If presentCityOfLiving is empty but homeDistrict has value, copy it
      if ((!data.presentCityOfLiving || data.presentCityOfLiving === '') && data.homeDistrict) {
        await doc.ref.update({
          presentCityOfLiving: data.homeDistrict,
          updatedAt: new Date().toISOString(),
        });
        console.log(`✅ Updated ${data.email}: ${data.homeDistrict}`);
        updated++;
      } else {
        skipped++;
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('\n📊 UPDATE SUMMARY\n');
    console.log(`✅ Updated: ${updated}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log('\n✅ Update completed!\n');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updatePresentCity()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
