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

async function checkBloodGroups() {
  const snapshot = await db.collection('profiles').get();
  const bloodGroups = new Set<string>();
  
  snapshot.forEach(doc => {
    const bg = doc.data().bloodGroup;
    if (bg) {
      bloodGroups.add(bg);
    }
  });
  
  console.log('Unique blood groups found:');
  Array.from(bloodGroups).sort().forEach(bg => {
    console.log(`  - "${bg}"`);
  });
}

checkBloodGroups().then(() => process.exit(0)).catch(console.error);
