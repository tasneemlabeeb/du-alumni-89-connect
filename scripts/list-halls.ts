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

async function listHalls() {
  const snapshot = await db.collection('profiles').get();
  const hallsMap = new Map<string, number>();
  
  snapshot.forEach(doc => {
    const hall = doc.data().hall;
    if (hall && hall.trim()) {
      const trimmed = hall.trim();
      hallsMap.set(trimmed, (hallsMap.get(trimmed) || 0) + 1);
    }
  });
  
  console.log('All unique hall names found:\n');
  console.log('Hall Name | Count');
  console.log('=' .repeat(70));
  
  Array.from(hallsMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([hall, count]) => {
      console.log(`"${hall}" | ${count}`);
    });
    
  console.log('\n' + '='.repeat(70));
  console.log(`Total unique hall variations: ${hallsMap.size}`);
}

listHalls().then(() => process.exit(0)).catch(console.error);
