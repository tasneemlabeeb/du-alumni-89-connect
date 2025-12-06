import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
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

async function checkEvents() {
  console.log('\n📅 Checking events in Firestore (Admin SDK)...\n');
  
  const eventsSnapshot = await db.collection('events').get();
  
  console.log(`Total events in database: ${eventsSnapshot.size}\n`);
  
  if (eventsSnapshot.empty) {
    console.log('❌ NO EVENTS FOUND IN FIRESTORE!');
    console.log('\n🔧 You need to:');
    console.log('   1. Go to http://localhost:3000/admin');
    console.log('   2. Click on "News & Events" section');
    console.log('   3. Create a new event');
    console.log('   4. Make sure to check the "Published" checkbox');
    console.log('   5. Save the event\n');
    return;
  }
  
  console.log('📋 All events in database:\n');
  eventsSnapshot.forEach(doc => {
    const data = doc.data();
    console.log(`Event: ${data.title}`);
    console.log(`  ID: ${doc.id}`);
    console.log(`  Published: ${data.published ? '✅ YES' : '❌ NO'}`);
    console.log(`  Event Date: ${data.event_date}`);
    console.log(`  Location: ${data.location || 'N/A'}`);
    console.log('');
  });
  
  const publishedEvents = eventsSnapshot.docs.filter(doc => doc.data().published === true);
  console.log(`\n✅ Published events: ${publishedEvents.length}/${eventsSnapshot.size}`);
  
  if (publishedEvents.length === 0) {
    console.log('\n⚠️  WARNING: No published events!');
    console.log('   Make sure to check the "Published" checkbox when creating events.\n');
  }
}

checkEvents().catch(console.error);
