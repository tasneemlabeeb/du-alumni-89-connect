import * as dotenv from 'dotenv';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

dotenv.config({ path: '.env.local' });

if (!getApps().length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };
  initializeApp({ credential: cert(serviceAccount as any) });
}

const db = getFirestore();

async function checkNews() {
  try {
    console.log('=== CHECKING NEWS ITEMS ===\n');
    const newsSnapshot = await db.collection('news').get();
    console.log(`Found ${newsSnapshot.size} news items\n`);

    newsSnapshot.docs.forEach((doc, i) => {
      const data = doc.data();
      console.log(`${i + 1}. ${data.title}`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   Published: ${data.published}`);
      console.log(`   Featured Image: ${data.featured_image_url || 'NONE'}`);
      console.log(`   Has Image: ${!!data.featured_image_url ? 'YES ✅' : 'NO ❌'}`);
      console.log('');
    });

    console.log('=== CHECKING EVENTS ===\n');
    const eventsSnapshot = await db.collection('events').get();
    console.log(`Found ${eventsSnapshot.size} events\n`);

    eventsSnapshot.docs.forEach((doc, i) => {
      const data = doc.data();
      console.log(`${i + 1}. ${data.title}`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   Published: ${data.published}`);
      console.log(`   Featured Image: ${data.featured_image_url || 'NONE'}`);
      console.log(`   Has Image: ${!!data.featured_image_url ? 'YES ✅' : 'NO ❌'}`);
      console.log('');
    });

  } catch (error) {
    console.error('ERROR:', error);
  }
}

checkNews();
